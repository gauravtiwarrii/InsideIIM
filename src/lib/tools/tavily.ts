import { tavily } from "@tavily/core";

export async function searchTavily(query: string, maxResults: number = 3) {
  try {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const response = await tvly.search(query, { maxResults });
    return response.results;
  } catch (e) {
    console.error("Tavily Search Error:", e);
    return [];
  }
}
