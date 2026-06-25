import { searchTavily } from "../tools/tavily";
import { getFinancialMetrics } from "../tools/finance";
import { createLLM } from "./llm";
import { FINANCIAL_PROMPT } from "./prompts";
import { GraphState, FinancialDataSchema } from "../schema";

export async function financialAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  try {
    let exactFinancialData = "Not available.";
    if (state.tickerSymbol) {
      const metrics = await getFinancialMetrics(state.tickerSymbol);
      if (metrics) {
        exactFinancialData = JSON.stringify(metrics, null, 2);
      }
    }

    const results = await searchTavily(`${state.companyName} revenue net income EPS market cap PE ratio financial health`);
    const llm = createLLM();

    const searchResultsText = results.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: any) => r.url);
    
    const prompt = FINANCIAL_PROMPT.replace("{companyName}", state.companyName)
      .replace("{exactFinancialData}", exactFinancialData)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(FinancialDataSchema, { method: "jsonMode", name: "financial_data" });
    const financialData = await structuredLlm.invoke(prompt);
    financialData.citations = citations;

    return {
      financialData,
      currentStep: "financial_complete",
    };
  } catch (error) {
    console.error("Financial analysis failed:", error);
    return {
      financialData: {
        revenue: "N/A",
        netIncome: "N/A",
        eps: "0",
        peRatio: "0",
        revenueGrowth: "0%",
        financialHealthScore: 50,
        keyStrengths: ["Data temporarily unavailable due to API limits"],
        keyWeaknesses: ["Data temporarily unavailable due to API limits"],
        citations: []
      },
      currentStep: "financial_complete"
    };
  }
}
