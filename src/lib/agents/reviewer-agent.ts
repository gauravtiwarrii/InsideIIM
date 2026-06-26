import { createLLM } from "./llm";
import { GraphState } from "../schema";
import { z } from "zod";

const ReviewSchema = z.object({
  approved: z.boolean().describe("True if the investment thesis is well-reasoned and confident, False if it needs revision"),
  comments: z.string().describe("Feedback on why it was rejected or approved. If rejected, specify what the investment agent needs to fix."),
});

export async function reviewerAgent(state: GraphState): Promise<Partial<GraphState>> {
  if (state.error) return {};
  if (state.revisionCount >= 2) {
    // Max revisions reached
    return { currentStep: "reviewer_complete" };
  }

  try {
    const llm = createLLM();

    const prompt = `You are a Senior Portfolio Manager reviewing an investment thesis.
Company: ${state.companyName}
Current Recommendation: ${state.investmentData?.recommendation}
Confidence: ${state.investmentData?.confidenceScore}
Reasoning: ${state.investmentData?.reasoning}

Critique the reasoning. If the reasoning is weak, vague, or confidence is inexplicably high/low given the data, reject it (approved: false) and provide strict feedback for the analyst to improve the thesis. If it's solid, approve it.`;

    const structuredLlm = llm.withStructuredOutput(ReviewSchema, { method: "jsonMode", name: "review_data" });
    const review = await structuredLlm.invoke(prompt);

    return {
      reviewComments: review.approved ? null : review.comments,
      currentStep: "reviewer_complete",
    };
  } catch (error) {
    console.error("Review Agent Error:", error);
    return {
      reviewComments: null, // Default to approved on rate limit
      currentStep: "reviewer_complete"
    };
  }
}
