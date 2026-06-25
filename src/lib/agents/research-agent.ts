import { searchTavily } from "../tools/tavily";
import { createLLM } from "./llm";
import { RESEARCH_PROMPT, TICKER_PROMPT } from "./prompts";
import { getHistoricalData } from "../tools/finance";
import { GraphState, ResearchDataSchema, TickerSchema } from "../schema";

export async function researchAgent(state: GraphState): Promise<Partial<GraphState>> {
  try {
    const results = await searchTavily(`${state.companyName} company overview competitors leadership`, 5);
    const llm = createLLM();

    const searchResultsText = results.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: any) => r.url);
    
    const prompt = RESEARCH_PROMPT.replace("{companyName}", state.companyName)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(ResearchDataSchema, { method: "jsonMode", name: "research_data" });
    const researchData = await structuredLlm.invoke(prompt);
    researchData.citations = citations;

    const tickerLlm = llm.withStructuredOutput(TickerSchema, { method: "jsonMode", name: "ticker_data" });
    const tickerPrompt = TICKER_PROMPT.replace("{companyName}", state.companyName);
    const tickerData = await tickerLlm.invoke(tickerPrompt);
    
    let chartData = null;
    if (tickerData.ticker) {
      chartData = await getHistoricalData(tickerData.ticker, 6);
    }

    return {
      researchData,
      tickerSymbol: tickerData.ticker || null,
      chartData: chartData || null,
      currentStep: "research_complete",
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Research failed";
    return { error: errMsg, currentStep: "error" };
  }
}
