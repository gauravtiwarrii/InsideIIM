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
    const errMsg = error instanceof Error ? error.message : "Investment analysis failed";
    return { error: errMsg, currentStep: "error" };
  }
}
