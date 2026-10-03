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

// Embed many texts in a single request. The OpenAI embeddings API accepts an array of
// inputs, so ingesting a manual costs one call per batch instead of one call per chunk
// (the old per-chunk loop was the main timeout risk). Results are returned in input order.
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.slice(0, MAX_INPUT_CHARS)),
  });
  // Sort by `index` defensively — the API returns them ordered, but we don't rely on it.
  return res.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export function embeddingToSql(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
