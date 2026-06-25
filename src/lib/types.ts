export interface ResearchResult {
  title: string;
  url: string;
  content: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
}

export interface FinancialInsights {
  revenueTrend: string;
  profitability: string;
  debtLevels: string;
  growthTrajectory: string;
  marketPosition: string;
  summary: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface InvestmentDecision {
  decision: "INVEST" | "HOLD" | "PASS";
  confidenceScore: number;
  reasoning: string;
  keyReasons: string[];
  riskFactors: string[];
}

export interface AgentState {
  companyName: string;
  tickerSymbol: string | null;
  chartData: ChartDataPoint[] | null;
  researchData: ResearchResult[];
  financialInsights: FinancialInsights | null;
  swotAnalysis: SwotAnalysis | null;
  investmentDecision: InvestmentDecision | null;
  currentStep: string;
  error: string | null;
}

export interface StreamEvent {
  type: "step" | "research" | "market_data" | "analysis" | "swot" | "decision" | "error" | "complete";
  data: any;
  message: string;
}
