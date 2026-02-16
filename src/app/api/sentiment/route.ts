import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function GET(request: NextRequest) {
  const weekParam = request.nextUrl.searchParams.get("week");
  const now = weekParam ? new Date(weekParam) : new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const events = await prisma.economicEvent.findMany({
    where: { dateTime: { gte: weekStart, lte: weekEnd } },
    include: { analysis: true },
    orderBy: { dateTime: "asc" },
  });

  if (events.length === 0) {
    return Response.json({ error: "No events this week" }, { status: 404 });
  }

  const eventContext = events
    .map((e) => {
      const dateStr = format(e.dateTime, "EEE MMM d, h:mm a");
      let ctx = `[${e.importance}] ${dateStr}: ${e.eventName}`;
      if (e.actual) ctx += ` | Actual: ${e.actual}`;
      if (e.forecast) ctx += ` | Forecast: ${e.forecast}`;
      if (e.previous) ctx += ` | Previous: ${e.previous}`;
      if (e.analysis) {
        ctx += ` | Impact: ${e.analysis.impactScore}/10 ${e.analysis.impactDirection}`;
        ctx += ` | Summary: ${e.analysis.summary}`;
      }
      return ctx;
    })
    .join("\n");

  const prompt = `You are a senior market strategist. Based on the following economic events and their AI analysis for the week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}, provide:

1. The overall weekly sentiment (BULLISH, BEARISH, or NEUTRAL)
2. A clear, detailed explanation of WHY this week leans that direction — reference specific events, data points, and their market implications
3. A counter argument presenting the opposite perspective — why someone could reasonably argue the other side

Events this week:
${eventContext}

Respond in this exact markdown format:

## Weekly Sentiment: [BULLISH/BEARISH/NEUTRAL]

### Why This Week Is [Bullish/Bearish/Neutral]

[2-4 paragraphs explaining the reasoning, referencing specific events and data]

### Counter Argument: The [Bull/Bear] Case

[2-3 paragraphs presenting the opposite view with specific reasoning]

### Key Events to Watch

[Bullet list of the 3-5 most important events and why they matter]

Be specific with data points and event names. Write for an informed retail trader.`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await genAI.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.4,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Sentiment stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "Failed to generate analysis" })}\n\n`
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
}
