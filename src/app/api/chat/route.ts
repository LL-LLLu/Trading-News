import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { streamChat } from "@/lib/gemini";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();

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

    // Stream response
    const encoder = new TextEncoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(messages, eventContext)) {
            assistantContent += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`)
            );
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
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
            )
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
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
