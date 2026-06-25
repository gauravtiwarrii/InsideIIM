import { z } from "zod";

export const ResearchDataSchema = z.object({
  overview: z.string().describe("Brief description of the company"),
  industry: z.string().describe("Primary industry sector"),
  marketPosition: z.string().describe("Market standing and share"),
  competitors: z.array(z.string()).describe("List of main competitors"),
  leadership: z.string().describe("Key executives or leadership overview"),
  citations: z.array(z.string().url()).describe("URLs used as sources").optional(),
});

export const FinancialDataSchema = z.object({
  revenue: z.string().describe("Revenue figure"),
  netIncome: z.string().describe("Net income figure"),
  eps: z.string().describe("Earnings per share"),
  marketCap: z.string().describe("Market capitalization"),
  peRatio: z.string().describe("Price-to-earnings ratio"),
  revenueGrowth: z.string().describe("YoY growth percentage"),
  financialHealthScore: z.number().min(0).max(100).describe("Financial Health Score (0-100)"),
  citations: z.array(z.string().url()).describe("URLs used as sources").optional(),
});

export const NewsDataSchema = z.object({
  newsSummary: z.string().describe("Brief summary of recent news"),
  productLaunches: z.array(z.string()).describe("Recent product launches"),
  acquisitions: z.array(z.string()).describe("Recent acquisitions"),
  lawsuits: z.array(z.string()).describe("Current or recent lawsuits"),
  partnerships: z.array(z.string()).describe("Key partnerships"),
  regulatoryIssues: z.array(z.string()).describe("Any regulatory issues"),
  newsSentimentScore: z.number().min(0).max(100).describe("News Sentiment Score (0-100)"),
  citations: z.array(z.string().url()).describe("URLs used as sources").optional(),
});

export const RiskDataSchema = z.object({
  competitionRisk: z.string().describe("Description of competitive threats"),
  regulatoryRisk: z.string().describe("Description of regulatory threats"),
  debtRisk: z.string().describe("Description of financial/debt risks"),
  marketRisk: z.string().describe("Description of broad market risks"),
  businessModelRisk: z.string().describe("Description of core business vulnerabilities"),
  riskScore: z.number().min(0).max(100).describe("Risk Score (100 = low risk, 0 = high risk)"),
  citations: z.array(z.string().url()).describe("URLs used as sources").optional(),
});

export const InvestmentDataSchema = z.object({
  investmentScore: z.number().min(0).max(100).describe("Overall Investment Score (0-100)"),
  confidenceScore: z.number().min(0).max(100).describe("Confidence in the recommendation (0-100)"),
  recommendation: z.enum(["INVEST", "HOLD", "PASS"]).describe("Final recommendation based on rules"),
  reasoning: z.string().describe("Detailed 3-paragraph explanation of your investment thesis."),
  bullCase: z.array(z.string()).describe("3 reasons why the stock could outperform expectations"),
  bearCase: z.array(z.string()).describe("3 reasons why the stock could underperform expectations"),
  catalysts: z.array(z.string()).describe("3-5 upcoming events or triggers that could significantly move the stock price"),
  holdingPeriod: z.enum(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"]).describe("Suggested investment holding period: SHORT_TERM (< 6 months), MEDIUM_TERM (6-18 months), LONG_TERM (> 18 months)"),
  targetPriceInsight: z.string().describe("Brief statement about the estimated fair value relative to current price, e.g. '15-20% upside from current levels' or 'fairly valued at current price'"),
});

export const TickerSchema = z.object({
  ticker: z.string().nullable().describe("The primary stock ticker symbol, or null if private/unknown"),
});

export const TechnicalDataSchema = z.object({
  trend: z.enum(["Bullish", "Bearish", "Neutral"]).describe("Price trend"),
  supportLevel: z.string().describe("Key support level"),
  resistanceLevel: z.string().describe("Key resistance level"),
  momentum: z.string().describe("Momentum description"),
  technicalScore: z.number().min(0).max(100).describe("Technical Score (0-100)"),
});

export const SentimentDataSchema = z.object({
  overallSentiment: z.enum(["Bullish", "Bearish", "Neutral"]).describe("Overall sentiment"),
  institutionalSentiment: z.string().describe("Institutional view"),
  retailSentiment: z.string().describe("Retail view"),
  keySentimentDrivers: z.array(z.string()).describe("Drivers of sentiment"),
  sentimentScore: z.number().min(0).max(100).describe("Sentiment Score (0-100)"),
});

// Infer types
export type ResearchData = z.infer<typeof ResearchDataSchema>;
export type FinancialData = z.infer<typeof FinancialDataSchema>;
export type NewsData = z.infer<typeof NewsDataSchema>;
export type RiskData = z.infer<typeof RiskDataSchema>;
export type InvestmentData = z.infer<typeof InvestmentDataSchema>;
export type TechnicalData = z.infer<typeof TechnicalDataSchema>;
export type SentimentData = z.infer<typeof SentimentDataSchema>;

// LangGraph state requires a specific shape, often using channels.
// For simplicity in a basic StateGraph, we can define the overall state interface:
export interface GraphState {
  companyName: string;
  tickerSymbol: string | null;
  chartData: { date: string; price: number }[] | null;
  
  researchData: ResearchData | null;
  financialData: FinancialData | null;
  newsData: NewsData | null;
  riskData: RiskData | null;
  technicalData: TechnicalData | null;
  sentimentData: SentimentData | null;
  
  investmentData: InvestmentData | null;
  
  reviewComments: string | null;
  revisionCount: number;
  
  reportData: any | null;
  error: string | null;
  currentStep: string;
}

