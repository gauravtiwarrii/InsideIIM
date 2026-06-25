import { searchTavily } from "../tools/tavily";
import { createLLM } from "./llm";
import { FINANCIAL_PROMPT } from "./prompts";
import { GraphState, FinancialDataSchema } from "../schema";

export async function financialAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  try {
    const results = await searchTavily(`${state.companyName} revenue net income EPS market cap PE ratio financial health`);
    const llm = createLLM();

    const searchResultsText = results.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: any) => r.url);
    
    const prompt = FINANCIAL_PROMPT.replace("{companyName}", state.companyName)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(FinancialDataSchema, { method: "jsonMode", name: "financial_data" });
    const financialData = await structuredLlm.invoke(prompt);
    financialData.citations = citations;

    return {
      financialData,
      currentStep: "financial_complete",
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Financial analysis failed";
    return { error: errMsg, currentStep: "error" };
  }
}
