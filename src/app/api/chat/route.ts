import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { buildChatPrompt } from "@/lib/prompts";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string") {
      return new Response(
        JSON.stringify({ error: "Gemini API key is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message
    if (sessionId) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: "user",
            content: lastMessage.content,
          },
        });
      }
    }

    // Build event context from current week
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const events = await prisma.economicEvent.findMany({
      where: { dateTime: { gte: weekStart, lte: weekEnd } },
      include: { analysis: true },
      orderBy: { dateTime: "asc" },
    });

    const eventContext = events
      .map((e) => {
        const dateStr = format(e.dateTime, "EEE MMM d, h:mm a");
        let ctx = `[${e.importance}] ${dateStr}: ${e.eventName}`;
        if (e.actual) ctx += ` | Actual: ${e.actual}`;
        if (e.forecast) ctx += ` | Forecast: ${e.forecast}`;
        if (e.previous) ctx += ` | Previous: ${e.previous}`;
        if (e.analysis) {
          ctx += ` | Impact: ${e.analysis.impactScore}/10 ${e.analysis.impactDirection}`;
          ctx += ` | ${e.analysis.summary}`;
        }
        return ctx;
      })
      .join("\n");

    // Use the user-provided API key
    const userGenAI = new GoogleGenAI({ apiKey });
    const systemPrompt = buildChatPrompt(eventContext);

    const contents = [
      { role: "user" as const, parts: [{ text: systemPrompt }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        parts: [{ text: m.content }],
      })),
    ];

    // Stream response
    const encoder = new TextEncoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await userGenAI.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents,
            config: { temperature: 0.7 },
          });

          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              assistantContent += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text })}\n\n`,
                ),
              );
            }
          }

          // Save assistant response
          if (sessionId) {
            await prisma.chatMessage.create({
              data: {
                sessionId,
                role: "assistant",
                content: assistantContent,
              },
            });
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Chat stream error:", error);
          const errMsg =
            String(error).includes("API_KEY_INVALID") ||
            String(error).includes("401")
              ? "Invalid API key. Please check your Gemini API key."
              : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errMsg })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Chat failed", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
