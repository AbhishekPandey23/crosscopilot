import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

// Chat model for answer generation
export const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Embedding model for vector search
export const embeddingModel = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Utility function to get embeddings as array
export async function getEmbedding(text: string): Promise<number[]> {
  const embedding = await embeddingModel.embedQuery(text);
  return embedding;
}

// Utility function to get embeddings for multiple texts
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings = await embeddingModel.embedDocuments(texts);
  return embeddings;
}
