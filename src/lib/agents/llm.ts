import { ChatOpenAI } from "@langchain/openai";

export function createLLM() {
  return new ChatOpenAI({
    modelName: "meta/llama-3.1-70b-instruct",
    apiKey: process.env.NVIDIA_API_KEY,
    configuration: {
      baseURL: "https://integrate.api.nvidia.com/v1",
    },
    temperature: 0.3,
    maxTokens: 4096,
    maxRetries: 1,
    timeout: 25000,
    modelKwargs: {
      response_format: { type: "json_object" }
    }
  });
}

export function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return text;
}
