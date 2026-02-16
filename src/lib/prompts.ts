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

export function buildWeeklyResearchPrompt(
  events: {
    eventName: string;
    dateTime: Date;
    actual?: string | null;
    forecast?: string | null;
    previous?: string | null;
    category: string;
    importance: string;
  }[]
): string {
  const eventSummaries = events
    .map((e) => {
      const dateStr = format(e.dateTime, "EEE MMM d");
      return `- [${e.importance}] ${dateStr}: ${e.eventName} (${e.category})${
        e.actual ? ` Actual: ${e.actual}` : ""
      }${e.forecast ? ` Forecast: ${e.forecast}` : ""}${
        e.previous ? ` Previous: ${e.previous}` : ""
      }`;
    })
    .join("\n");

  const highImpactNames = events
    .filter((e) => e.importance === "HIGH")
    .map((e) => e.eventName)
    .join(", ");

  return `You are a senior market research analyst. Search for the latest news, analyst commentary, and market analysis related to this week's economic calendar events.

THIS WEEK'S KEY ECONOMIC EVENTS:
${eventSummaries}

RESEARCH THE FOLLOWING (search the web for each):

1. **Recent Market Commentary**: What are major investment banks (Goldman Sachs, JP Morgan, Morgan Stanley, Bank of America, Citi, UBS, Deutsche Bank) and financial media (Bloomberg, Reuters, CNBC, Financial Times, WSJ) saying about the current economic environment and this week's data?

2. **Bullish Arguments**: What are the strongest bull case arguments? Which analysts are optimistic? What positive economic trends support a constructive market view? Include specific analyst names and their reasoning.

3. **Bearish Arguments**: What are the strongest bear case arguments? Which analysts are cautious or bearish? What risks are being highlighted? Include specific analyst names and their reasoning.

4. **Fed Policy Context**: What is the latest from Federal Reserve officials? What are current market expectations for rate cuts/hikes? Reference recent Fed speeches, meeting minutes, or dot plot data.

5. **Market Positioning**: How are markets positioned going into this week? What do flows, sentiment surveys (AAII, Investors Intelligence), and positioning data (COT, options market) show?

6. **Key Event Previews**: For the high-impact events (${highImpactNames}), what are the specific consensus forecasts and ranges? What leading indicators or models suggest about potential surprises?

7. **Geopolitical & Macro Risks**: Any current geopolitical tensions, trade policy changes, or global macro developments that could impact US markets this week?

Be specific: include analyst names, firm names, specific forecasts, data points, and dates. Cite your sources.`;
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
  }[],
  webResearch?: string
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

  const researchSection = webResearch
    ? `\n\nCURRENT MARKET RESEARCH & ANALYST COMMENTARY (from web search):\n${webResearch}\n`
    : "";

  return `You are a chief market strategist preparing a weekly economic outlook report for institutional investors. Your analysis must be grounded in real current data, analyst opinions, and market conditions — not generic boilerplate.
${researchSection}
THIS WEEK'S ECONOMIC CALENDAR:
${eventSummaries}

CRITICAL INSTRUCTIONS:
- Base your analysis on the SPECIFIC research and analyst commentary provided above
- Reference real analyst names, firm names, and specific forecasts/opinions where available
- Present BOTH the bull case and the bear case for each theme — do not be one-sided
- Include specific data points, percentages, and levels — avoid vague language
- Your executive summary should read like a Bloomberg or Reuters weekly market preview
- For sector rotation, explain the reasoning using current market dynamics, not textbook definitions

Provide:
1. overallSentiment: The net directional bias for US equities this week (BULLISH/BEARISH/NEUTRAL). Consider both bull and bear arguments before deciding.
2. executiveSummary: 2-3 paragraph executive summary covering the week's key themes, risks, and opportunities. Reference specific analyst views from BOTH bulls and bears. Include specific data points and market levels.
3. keyEvents: Rank the top events by market impact with reasoning (include impactScore 1-10). For each event, note what a beat vs miss would mean for markets.
4. themeAnalysis: Identify 2-4 macro themes emerging from this week's data. For each theme, present both the bullish interpretation and the bearish interpretation with specific analyst citations.
5. riskAssessment: Key risks for the week with probability ratings. Include both upside risks (positive surprises) and downside risks.
6. sectorRotation: Recommended sector positioning across all 11 GICS sectors. Base reasoning on current earnings trends, valuation, and the specific economic data this week — not generic descriptions.`;
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
