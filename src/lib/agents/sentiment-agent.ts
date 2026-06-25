import { PromptTemplate } from "@langchain/core/prompts";
import { GraphState } from "../schema";
import { SENTIMENT_PROMPT } from "./prompts";
import { createLLM } from "./llm";
import { searchTavily } from "../tools/tavily";

export async function sentimentAgent(state: GraphState) {
  const { companyName } = state;
  const llm = createLLM();

  try {
    const searchResultsRaw = await searchTavily(`${companyName} stock market sentiment retail institutional view`);
    const searchResults = JSON.stringify(searchResultsRaw);
    
    const prompt = PromptTemplate.fromTemplate(SENTIMENT_PROMPT);
    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
      companyName,
      searchResults,
    });
    
    return {
      sentimentData: JSON.parse(response.content as string)
    };
  } catch (error) {
    console.error("Sentiment Agent Error:", error);
    return {
      sentimentData: {
        overallSentiment: "Neutral",
        institutionalSentiment: "Unknown",
        retailSentiment: "Unknown",
        keySentimentDrivers: [],
        sentimentScore: 50
      }
    };
  }
}
