import { GoogleGenAI } from "@google/genai";
import { EventAnalysisResult, WeeklyOutlookResult } from "@/types/events";
import {
  buildEventAnalysisPrompt,
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

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: EVENT_ANALYSIS_SCHEMA,
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  return JSON.parse(text) as EventAnalysisResult;
}

export async function generateWeeklyOutlook(events: {
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
}[]): Promise<WeeklyOutlookResult> {
  const prompt = buildWeeklyOutlookPrompt(events);

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: WEEKLY_OUTLOOK_SCHEMA,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");

  return JSON.parse(text) as WeeklyOutlookResult;
}

export async function* streamChat(
  messages: { role: string; content: string }[],
  eventContext: string
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
