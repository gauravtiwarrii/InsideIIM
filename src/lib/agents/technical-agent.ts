
import { PromptTemplate } from "@langchain/core/prompts";
import { GraphState } from "../schema";
import { TECHNICAL_PROMPT } from "./prompts";
import { createLLM } from "./llm";

export async function technicalAgent(state: GraphState) {
  const { companyName, chartData } = state;
  const llm = createLLM();

  if (!chartData || chartData.length === 0) {
    return {
      technicalData: {
        trend: "Neutral" as const,
        supportLevel: "N/A",
        resistanceLevel: "N/A",
        momentum: "Not enough chart data available",
        technicalScore: 50
      }
    };
  }

  // Format chart data for the prompt (e.g., last 30 data points)
  const recentData = chartData.slice(-30).map(d => `${d.date}: $${d.price.toFixed(2)}`).join("\\n");

  const prompt = PromptTemplate.fromTemplate(TECHNICAL_PROMPT);
  const chain = prompt.pipe(llm);

  try {
    const response = await chain.invoke({
      companyName,
      chartData: recentData,
    });
    
    return {
      technicalData: JSON.parse(response.content as string)
    };
  } catch (error) {
    console.error("Technical Agent Error:", error);
    return {
      technicalData: {
        trend: "Neutral" as const,
        supportLevel: "N/A",
        resistanceLevel: "N/A",
        momentum: "Technical analysis is currently unavailable due to API rate limits.",
        technicalScore: 50
      },
      currentStep: "technical_complete"
    };
  }
}
