export interface ScrapedEvent {
  eventName: string;
  eventSlug: string;
  dateTime: Date;
  period?: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  unit?: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  category: EventCategory;
  sourceUrl?: string;
}

export type EventCategory =
  | "EMPLOYMENT"
  | "INFLATION"
  | "GDP"
  | "MANUFACTURING"
  | "HOUSING"
  | "CONSUMER"
  | "TRADE"
  | "MONETARY_POLICY"
  | "GOVERNMENT"
  | "ENERGY"
  | "OTHER";

export interface EventAnalysisResult {
  impactScore: number;
  impactDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  summary: string;
  detailedAnalysis: string;
  affectedSectors: string[];
  affectedAssets: string[];
  tradingImplications: string[];
  historicalContext: string;
  riskFactors: string[];
  keyLevelsToWatch?: string;
}

export interface WeeklyOutlookResult {
  overallSentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  executiveSummary: string;
  keyEvents: Array<{
    eventName: string;
    impactScore: number;
    reasoning: string;
  }>;
  themeAnalysis: Array<{
    theme: string;
    description: string;
    implications: string;
  }>;
  riskAssessment: Array<{
    risk: string;
    probability: "HIGH" | "MEDIUM" | "LOW";
    impact: string;
  }>;
  sectorRotation: Array<{
    sector: string;
    outlook: "OVERWEIGHT" | "NEUTRAL" | "UNDERWEIGHT";
    reasoning: string;
  }>;
}
