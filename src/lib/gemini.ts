import { GoogleGenAI } from "@google/genai";
import { EventAnalysisResult, WeeklyOutlookResult } from "@/types/events";
import {
  buildEventAnalysisPrompt,
  buildWeeklyResearchPrompt,
  buildWeeklyOutlookPrompt,
  buildChatPrompt,
} from "./prompts";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const EVENT_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    impactScore: { type: "integer" as const, minimum: 1, maximum: 10 },
    impactDirection: {
      type: "string" as const,
      enum: ["BULLISH", "BEARISH", "NEUTRAL"],
    },
    summary: { type: "string" as const },
    detailedAnalysis: { type: "string" as const },
    affectedSectors: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    affectedAssets: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    tradingImplications: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    historicalContext: { type: "string" as const },
    riskFactors: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    keyLevelsToWatch: { type: "string" as const },
  },
  required: [
    "impactScore",
    "impactDirection",
    "summary",
    "detailedAnalysis",
    "affectedSectors",
    "affectedAssets",
    "tradingImplications",
    "historicalContext",
    "riskFactors",
  ],
};

const WEEKLY_OUTLOOK_SCHEMA = {
  type: "object" as const,
  properties: {
    overallSentiment: {
      type: "string" as const,
      enum: ["BULLISH", "BEARISH", "NEUTRAL"],
    },
    executiveSummary: { type: "string" as const },
    keyEvents: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          eventName: { type: "string" as const },
          impactScore: { type: "integer" as const },
          reasoning: { type: "string" as const },
        },
        required: ["eventName", "impactScore", "reasoning"],
      },
    },
    themeAnalysis: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          theme: { type: "string" as const },
          description: { type: "string" as const },
          implications: { type: "string" as const },
        },
        required: ["theme", "description", "implications"],
      },
    },
    riskAssessment: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          risk: { type: "string" as const },
          probability: {
            type: "string" as const,
            enum: ["HIGH", "MEDIUM", "LOW"],
          },
          impact: { type: "string" as const },
        },
        required: ["risk", "probability", "impact"],
      },
    },
    sectorRotation: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          sector: { type: "string" as const },
          outlook: {
            type: "string" as const,
            enum: ["OVERWEIGHT", "NEUTRAL", "UNDERWEIGHT"],
          },
          reasoning: { type: "string" as const },
        },
        required: ["sector", "outlook", "reasoning"],
      },
    },
  },
  required: [
    "overallSentiment",
    "executiveSummary",
    "keyEvents",
    "themeAnalysis",
    "riskAssessment",
    "sectorRotation",
  ],
};

const ANALYSIS_MODELS = ["gemini-3-pro-preview", "gemini-2.5-pro"] as const;

async function generateWithFallback(config: {
  contents: string;
  schema: typeof EVENT_ANALYSIS_SCHEMA | typeof WEEKLY_OUTLOOK_SCHEMA;
  temperature: number;
}): Promise<string> {
  let lastError: unknown;
  for (const model of ANALYSIS_MODELS) {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: config.contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: config.schema,
          temperature: config.temperature,
        },
      });
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      console.log(`[Gemini] Success with model: ${model}`);
      return text;
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        console.warn(`[Gemini] ${model} quota exhausted, trying fallback...`);
        lastError = err;
        continue;
      }
      throw err; // Non-quota errors are thrown immediately
    }
  }
  throw lastError;
}

export async function analyzeEvent(event: {
  eventName: string;
  dateTime: Date;
  period?: string | null;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  category: string;
}): Promise<EventAnalysisResult> {
  const prompt = buildEventAnalysisPrompt(event);

  const text = await generateWithFallback({
    contents: prompt,
    schema: EVENT_ANALYSIS_SCHEMA,
    temperature: 0.3,
  });

  return JSON.parse(text) as EventAnalysisResult;
}

export async function generateWeeklyOutlook(
  events: {
    eventName: string;
    dateTime: Date;
    actual?: string | null;
    forecast?: string | null;
    previous?: string | null;
    category: string;
    importance: string;
    analysis?: {
      impactScore: number;
      impactDirection: string;
      summary: string;
    } | null;
  }[],
): Promise<WeeklyOutlookResult> {
  // Step 1: Web research with Google Search grounding
  console.log("[Outlook] Step 1: Gathering web research with Google Search...");
  const researchPrompt = buildWeeklyResearchPrompt(events);

  const researchResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: researchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    },
  });

  const webResearch = researchResponse.text || "";
  console.log(
    `[Outlook] Research gathered: ${webResearch.length} chars from web`,
  );

  // Step 2: Generate structured outlook using research as context
  console.log("[Outlook] Step 2: Generating structured outlook...");
  const outlookPrompt = buildWeeklyOutlookPrompt(events, webResearch);

  const text = await generateWithFallback({
    contents: outlookPrompt,
    schema: WEEKLY_OUTLOOK_SCHEMA,
    temperature: 0.4,
  });

  return JSON.parse(text) as WeeklyOutlookResult;
}

export async function generateWeeklySentiment(
  events: {
    eventName: string;
    dateTime: Date;
    period?: string | null;
    actual?: string | null;
    forecast?: string | null;
    previous?: string | null;
    importance: string;
    analysis?: {
      impactScore: number;
      impactDirection: string;
      summary: string;
    } | null;
  }[],
): Promise<{ sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"; markdown: string }> {
  const { format } = await import("date-fns");

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

  const weekStart = events.length > 0 ? events[0].dateTime : new Date();
  const weekEnd =
    events.length > 0 ? events[events.length - 1].dateTime : new Date();

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

  let response;
  let lastError: unknown;
  for (const model of ANALYSIS_MODELS) {
    try {
      response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
        },
      });
      console.log(`[WeeklySentiment] Success with model: ${model}`);
      break;
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        console.warn(
          `[WeeklySentiment] ${model} quota exhausted, trying fallback...`,
        );
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  if (!response) throw lastError;

  const markdown = response.text || "";

  // Parse sentiment from the markdown heading
  let sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  const match = markdown.match(
    /Weekly Sentiment:\s*(BULLISH|BEARISH|NEUTRAL)/i,
  );
  if (match) {
    sentiment = match[1].toUpperCase() as "BULLISH" | "BEARISH" | "NEUTRAL";
  }

  return { sentiment, markdown };
}

export interface WebForecastResult {
  forecast: string;
  sources: Array<{ title: string; url?: string }>;
}

export async function generateWebForecast(event: {
  eventName: string;
  dateTime: Date;
  period?: string | null;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  category: string;
  importance: string;
}): Promise<WebForecastResult> {
  const now = new Date();
  const isReleased = event.actual != null && event.actual !== "";
  const mode = isReleased ? "review" : "forecast";

  const prompt = isReleased
    ? `The ${event.eventName} for ${event.period || "the latest period"} was just released with an actual value of ${event.actual} (forecast was ${event.forecast || "N/A"}, previous was ${event.previous || "N/A"}).

Search for the latest news and market reactions from at least 5 different sources (major financial news outlets, investment banks, government agencies, economic research firms). Write a comprehensive market review with the following sections:

## Market Reaction
How stocks (S&P 500, Dow, Nasdaq), bonds (Treasury yields), and currencies (USD) reacted immediately after the release. Include specific numbers and moves.

## Wall Street Analysis
What 2-3 named analysts or firms (e.g., Goldman Sachs, JP Morgan, Morgan Stanley) are saying about this data. Include their specific commentary and outlook.

## Fed Policy Implications
What this data means for the Federal Reserve's interest rate path. Reference any recent Fed speeches or dot plot expectations.

## Historical Context
How this reading compares to the historical trend. Is it unusually high/low? How did markets react in similar past scenarios? Reference specific past episodes.

## Counter Argument
Present the bear case or contrarian view — why this data might be misleading or why markets could be over/under-reacting. What risks are being overlooked?

Be specific with data points, analyst names/firms, and market moves. Each section should be 2-3 sentences minimum.`
    : `The ${event.eventName} for ${event.period || "the upcoming period"} is scheduled to be released on ${event.dateTime.toLocaleDateString()}. The previous reading was ${event.previous || "N/A"} and the consensus forecast is ${event.forecast || "not yet available"}.

Search for the latest news, analyst forecasts, and market expectations from at least 5 different sources (major financial news outlets, investment banks, government agencies, economic research firms). Write a comprehensive pre-release forecast with the following sections:

## Consensus Forecast
What the consensus expects and why. Include specific forecasts from 2-3 named banks or economists (e.g., Goldman Sachs expects X, Morgan Stanley sees Y).

## Key Drivers
What economic factors and leading indicators suggest about this release. What recent data points (e.g., regional surveys, related indicators) give us clues?

## Upside/Downside Scenarios
Specific factors that could drive a positive surprise vs a negative surprise. What would a beat or miss look like in numbers?

## Historical Context
How has this indicator trended over the past several months? What's the typical revision pattern? How have markets historically reacted to surprises in this data?

## Counter Argument
Present the contrarian view — why the consensus might be wrong. What risks or factors are most analysts underweighting? What could blindside the market?

Be specific with analyst names/firms, forecast ranges, and relevant economic context. Each section should be 2-3 sentences minimum.`;

  let response;
  let lastError: unknown;
  for (const model of ANALYSIS_MODELS) {
    try {
      response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
        },
      });
      console.log(`[WebForecast] Success with model: ${model}`);
      break;
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        console.warn(
          `[WebForecast] ${model} quota exhausted, trying fallback...`,
        );
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  if (!response) throw lastError;

  const text = response.text || "";

  // Extract grounding sources from metadata
  const metadata = response.candidates?.[0]?.groundingMetadata;
  const sources: Array<{ title: string; url?: string }> = [];
  if (metadata?.groundingChunks) {
    for (const chunk of metadata.groundingChunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Source",
          url: chunk.web.uri,
        });
      }
    }
  }

  return {
    forecast: `[${mode === "review" ? "POST-RELEASE REVIEW" : "PRE-RELEASE FORECAST"}]\n\n${text}`,
    sources,
  };
}

export async function* streamChat(
  messages: { role: string; content: string }[],
  eventContext: string,
): AsyncGenerator<string> {
  const systemPrompt = buildChatPrompt(eventContext);

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    ...messages.map((m) => ({
      role: (m.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: m.content }],
    })),
  ];

  const response = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: {
      temperature: 0.7,
    },
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) yield text;
  }
}
