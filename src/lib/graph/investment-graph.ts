import { StateGraph, END, START } from "@langchain/langgraph";
import { GraphState } from "../schema";
import { researchAgent } from "../agents/research-agent";
import { financialAgent } from "../agents/financial-agent";
import { newsAgent } from "../agents/news-agent";
import { riskAgent } from "../agents/risk-agent";
import { technicalAgent } from "../agents/technical-agent";
import { sentimentAgent } from "../agents/sentiment-agent";
import { investmentAgent } from "../agents/investment-agent";
import { reviewerAgent } from "../agents/reviewer-agent";

// Define the StateGraph schema
const graphStateChannels = {
  companyName: {
    value: (x: string, y: string) => y ?? x,
    default: () => "",
  },
  tickerSymbol: {
    value: (x: string | null, y: string | null) => y ?? x,
    default: () => null,
  },
  chartData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  researchData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  financialData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  newsData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  riskData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  technicalData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  sentimentData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  investmentData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  reviewComments: {
    value: (_x: string | null, y: string | null | undefined) => y === undefined ? _x : y,
    default: () => null,
  },
  revisionCount: {
    value: (x: number, y: number) => y ?? x,
    default: () => 0,
  },
  reportData: {
    value: (x: any, y: any) => y ?? x,
    default: () => null,
  },
  error: {
    value: (x: string | null, y: string | null) => y ?? x,
    default: () => null,
  },
  currentStep: {
    value: (x: string, y: string) => y ?? x,
    default: () => "start",
  },
};

// Routing function
function routeAfterReview(state: GraphState) {
  if (state.error) return END;
  if (state.reviewComments && state.revisionCount < 2) {
    return "investment"; // Go back to investment analyst
  }
  return "report"; // Proceed to report generation
}

// Helper to delay execution
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Parallel analysis node: runs financial, news, risk, technical, and sentiment concurrently with a slight stagger
async function parallelAnalysis(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  const [financialResult, newsResult, riskResult, technicalResult, sentimentResult] = await Promise.all([
    financialAgent(state),
    delay(3000).then(() => newsAgent(state)),
    delay(6000).then(() => riskAgent(state)),
    delay(9000).then(() => technicalAgent(state)),
    delay(12000).then(() => sentimentAgent(state))
  ]);

  return {
    ...financialResult,
    ...newsResult,
    ...riskResult,
    ...technicalResult,
    ...sentimentResult,
    currentStep: "parallel_complete",
  };
}

// Build the graph — research first, then parallel analysis, then investment → reviewer
const builder = new StateGraph<GraphState>({ channels: graphStateChannels })
  .addNode("research", researchAgent)
  .addNode("parallel_analysis", parallelAnalysis)
  .addNode("investment", investmentAgent)
  .addNode("reviewer", reviewerAgent)
  .addNode("report", async (state) => {
    return {
      reportData: {
        companyName: state.companyName,
        tickerSymbol: state.tickerSymbol,
        chartData: state.chartData,
        researchData: state.researchData,
        financialData: state.financialData,
        newsData: state.newsData,
        riskData: state.riskData,
        technicalData: state.technicalData,
        sentimentData: state.sentimentData,
        investmentData: state.investmentData,
      },
      currentStep: "complete"
    };
  });

// research → parallel(financial+news+risk) → investment → reviewer → report
builder.addEdge(START, "research");
builder.addEdge("research", "parallel_analysis");
builder.addEdge("parallel_analysis", "investment");
builder.addEdge("investment", "reviewer");
builder.addConditionalEdges("reviewer", routeAfterReview, {
  investment: "investment",
  report: "report",
  [END]: END
});
builder.addEdge("report", END);

export const investmentGraph = builder.compile();

