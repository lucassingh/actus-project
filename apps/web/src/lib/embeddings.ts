import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// text-embedding-3-small → 1536 dimensions, matches KnowledgeBase.problem_embedding vector(1536)
const EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_INPUT_CHARS = 8000;

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, MAX_INPUT_CHARS),
  });
  return res.data[0].embedding;
}

export function embeddingToSql(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
