import { searchTavily } from "../tools/tavily";
import { createLLM } from "./llm";
import { RISK_PROMPT } from "./prompts";
import { GraphState, RiskDataSchema } from "../schema";

export async function riskAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  try {
    const results = await searchTavily(`${state.companyName} competition risk regulatory issues debt market risk business model vulnerabilities`);
    const llm = createLLM();

    const searchResultsText = results.map((r: { title: string; content: string; url: string }, i: number) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`).join("\n\n");
    const citations = results.map((r: { url: string }) => r.url);

    const prompt = RISK_PROMPT.replace("{companyName}", state.companyName)
      .replace("{searchResults}", searchResultsText);

    const structuredLlm = llm.withStructuredOutput(RiskDataSchema, { method: "jsonMode", name: "risk_data" });
    const riskData = await structuredLlm.invoke(prompt);
    riskData.citations = citations;

    return {
      riskData,
      currentStep: "risk_complete",
    };
  } catch (error) {
    console.error("Risk Agent Error:", error);
    return {
      riskData: {
        competitionRisk: "Data temporarily unavailable due to API rate limits.",
        regulatoryRisk: "Data temporarily unavailable due to API rate limits.",
        debtRisk: "Data temporarily unavailable due to API rate limits.",
        marketRisk: "Data temporarily unavailable due to API rate limits.",
        businessModelRisk: "Data temporarily unavailable due to API rate limits.",
        riskScore: 50,
        citations: []
      },
      currentStep: "risk_complete"
    };
  }
}
