import { searchTavily } from "../tools/tavily";
import { createLLM } from "./llm";
import { NEWS_PROMPT } from "./prompts";
import { GraphState, NewsDataSchema } from "../schema";

export async function newsAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  try {
    const results = await searchTavily(`${state.companyName} latest news product launches acquisitions lawsuits partnerships regulatory`);
    const llm = createLLM();

    const searchResultsText = results.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: any) => r.url);

    const prompt = NEWS_PROMPT.replace("{companyName}", state.companyName)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(NewsDataSchema, { method: "jsonMode", name: "news_data" });
    const newsData = await structuredLlm.invoke(prompt);
    newsData.citations = citations;

    return {
      newsData,
      currentStep: "news_complete",
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "News analysis failed";
    return { error: errMsg, currentStep: "error" };
  }
}
