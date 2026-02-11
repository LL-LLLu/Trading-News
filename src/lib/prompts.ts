import { format } from "date-fns";

export function buildEventAnalysisPrompt(event: {
  eventName: string;
  dateTime: Date;
  period?: string | null;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  category: string;
}): string {
  const dateStr = format(event.dateTime, "MMMM d, yyyy");
  const hasData = event.actual || event.forecast || event.previous;

  return `You are a senior financial analyst specializing in macroeconomic data and its market impact. Analyze the following economic event and provide a structured assessment.

EVENT DETAILS:
- Name: ${event.eventName}
- Date: ${dateStr}
- Category: ${event.category}
${event.period ? `- Period: ${event.period}` : ""}
${event.actual ? `- Actual: ${event.actual}` : ""}
${event.forecast ? `- Forecast: ${event.forecast}` : ""}
${event.previous ? `- Previous: ${event.previous}` : ""}

${
  hasData && event.actual && event.forecast
    ? `NOTE: Compare actual vs forecast to determine if this is a beat, miss, or in-line result. Factor the magnitude of any surprise into your analysis.`
    : event.actual
      ? `NOTE: Only actual data is available. Analyze based on the absolute value and historical context.`
      : `NOTE: This event has not yet occurred or data is pending. Provide a forward-looking analysis based on expectations and historical patterns.`
}

Provide your analysis with:
1. impactScore (1-10): How significant is this for markets? 1=minimal, 5=moderate, 10=market-moving
2. impactDirection: BULLISH, BEARISH, or NEUTRAL for US equities
3. summary: 1-2 sentence overview of the market impact
4. detailedAnalysis: 2-3 paragraph deep analysis covering the data, implications, and market reaction expectations
5. affectedSectors: List of GICS sectors most impacted (e.g., "Technology", "Financials", "Consumer Discretionary")
6. affectedAssets: Specific assets/instruments affected (e.g., "SPY", "TLT", "USD/JPY", "Gold")
7. tradingImplications: Actionable trading insights (e.g., "Consider reducing duration exposure")
8. historicalContext: How similar readings have impacted markets historically
9. riskFactors: Key risks or caveats to this analysis
10. keyLevelsToWatch: Important technical or fundamental levels (optional)`;
}

export function buildWeeklyOutlookPrompt(
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
  }[]
): string {
  const eventSummaries = events
    .map((e) => {
      const dateStr = format(e.dateTime, "EEE MMM d");
      const analysis = e.analysis
        ? ` | Impact: ${e.analysis.impactScore}/10 ${e.analysis.impactDirection} - ${e.analysis.summary}`
        : "";
      return `- [${e.importance}] ${dateStr}: ${e.eventName} (${e.category})${
        e.actual ? ` Actual: ${e.actual}` : ""
      }${e.forecast ? ` Forecast: ${e.forecast}` : ""}${
        e.previous ? ` Previous: ${e.previous}` : ""
      }${analysis}`;
    })
    .join("\n");

  return `You are a chief market strategist preparing a weekly economic outlook report for institutional investors. Analyze the following week's economic events and provide a comprehensive market outlook.

THIS WEEK'S ECONOMIC CALENDAR:
${eventSummaries}

Provide:
1. overallSentiment: The net directional bias for US equities this week (BULLISH/BEARISH/NEUTRAL)
2. executiveSummary: 2-3 paragraph executive summary covering the week's key themes, risks, and opportunities
3. keyEvents: Rank the top events by market impact with reasoning (include impactScore 1-10)
4. themeAnalysis: Identify 2-4 macro themes emerging from this week's data (e.g., "Inflation persistence", "Labor market cooling")
5. riskAssessment: Key risks for the week with probability ratings
6. sectorRotation: Recommended sector positioning across all 11 GICS sectors`;
}

export function buildChatPrompt(eventContext: string): string {
  return `You are an AI financial market analyst assistant embedded in an economic calendar dashboard. You have access to the following current economic data and analyses:

${eventContext}

Guidelines:
- Provide helpful, accurate analysis of economic events and market implications
- Reference specific data points from the calendar when relevant
- Be concise but thorough in your explanations
- If asked about events not in your context, acknowledge the limitation
- Never provide specific trade recommendations or financial advice
- Focus on education and market understanding
- Use professional financial terminology appropriately`;
}
