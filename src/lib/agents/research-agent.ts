import { searchTavily } from "../tools/tavily";
import { createLLM } from "./llm";
import { RESEARCH_PROMPT, TICKER_PROMPT } from "./prompts";
import { getHistoricalData } from "../tools/finance";
import { GraphState, ResearchDataSchema, TickerSchema } from "../schema";

export async function researchAgent(state: GraphState): Promise<Partial<GraphState>> {
  try {
    const resultsPromise = searchTavily(`${state.companyName} company overview competitors leadership`, 5);
    const llm = createLLM();

    const tickerLlm = llm.withStructuredOutput(TickerSchema, { method: "jsonMode", name: "ticker_data" });
    const tickerPrompt = TICKER_PROMPT.replace("{companyName}", state.companyName);
    
    // We can fetch ticker symbol while Tavily search is happening
    const tickerPromise = tickerLlm.invoke(tickerPrompt);

    const [results, tickerData] = await Promise.all([resultsPromise, tickerPromise]);

    const searchResultsText = results.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: any) => r.url);
    
    const prompt = RESEARCH_PROMPT.replace("{companyName}", state.companyName)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(ResearchDataSchema, { method: "jsonMode", name: "research_data" });
    
    // Run the heavy research LLM call in parallel with fetching chart data
    const researchDataPromise = structuredLlm.invoke(prompt);
    const chartDataPromise = tickerData.ticker ? getHistoricalData(tickerData.ticker, 6) : Promise.resolve(null);

    const [researchData, chartData] = await Promise.all([researchDataPromise, chartDataPromise]);
    
    researchData.citations = citations;

    return {
      researchData,
      tickerSymbol: tickerData.ticker || null,
      chartData: chartData || null,
      currentStep: "research_complete",
    };
  } catch (error) {
    console.error("Research Agent Error:", error);
    return {
      researchData: {
        companyOverview: "Data temporarily unavailable due to API rate limits.",
        businessModel: "Data temporarily unavailable",
        leadership: "Data temporarily unavailable",
        keyCompetitors: ["Data temporarily unavailable"],
        citations: []
      },
      currentStep: "research_complete"
    };
  }
}
