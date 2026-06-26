import { createLLM } from "./llm";
import { INVESTMENT_PROMPT } from "./prompts";
import { GraphState, InvestmentDataSchema } from "../schema";

export async function investmentAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};

  try {
    const llm = createLLM();

    let prompt = INVESTMENT_PROMPT
      .replace("{companyName}", state.companyName)
      .replace("{researchData}", JSON.stringify(state.researchData, null, 2))
      .replace("{financialData}", JSON.stringify(state.financialData, null, 2))
      .replace("{newsData}", JSON.stringify(state.newsData, null, 2))
      .replace("{riskData}", JSON.stringify(state.riskData, null, 2))
      .replace("{technicalData}", JSON.stringify(state.technicalData, null, 2))
      .replace("{sentimentData}", JSON.stringify(state.sentimentData, null, 2));

    if (state.reviewComments) {
      prompt += `\n\n[REVIEWER FEEDBACK]: ${state.reviewComments}\nPlease revise your recommendation considering this feedback.`;
    }

    const structuredLlm = llm.withStructuredOutput(InvestmentDataSchema, { method: "jsonMode", name: "investment_data" });
    const investmentData = await structuredLlm.invoke(prompt);

    return {
      investmentData,
      currentStep: "investment_complete",
      revisionCount: (state.revisionCount || 0) + 1
    };
  } catch (error) {
    console.error("Investment Agent Error:", error);
    return {
      investmentData: {
        recommendation: "HOLD",
        investmentScore: 50,
        confidenceScore: 50,
        holdingPeriod: "MEDIUM_TERM",
        targetPriceInsight: "Unable to calculate target price due to rate limits.",
        reasoning: "Due to temporary API rate limits from the AI provider, a complete investment recommendation cannot be generated at this time. We are defaulting to a neutral HOLD. Please try again in a few moments.",
        bullCase: ["Awaiting API quota reset to analyze bull case."],
        bearCase: ["Awaiting API quota reset to analyze bear case."],
        catalysts: ["Awaiting API quota reset to analyze catalysts."]
      },
      currentStep: "investment_complete"
    };
  }
}
