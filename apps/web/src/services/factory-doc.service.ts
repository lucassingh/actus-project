import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateEmbeddings, embeddingToSql } from "@/lib/embeddings";
import { extractPdfPages } from "@/lib/pdf";
import { chunkPages } from "@/lib/chunking";

// How many chunks to embed per Inngest step. One OpenAI embeddings call per batch; each
// completed batch is an Inngest checkpoint, so a transient failure resumes mid-document
// instead of re-embedding everything.
export const EMBED_BATCH_SIZE = 100;

// ─────────────────────────────────────────────────────────────────────────────
// Ingestion is a two-phase pipeline:
//   1. createFactoryDoc()  — synchronous, on upload: parse + chunk + persist chunk rows
//      (no embeddings). This is CPU-only and fast; the old timeout risk was the serial
//      embedding calls, not the parsing.
//   2. embedPendingChunks() — durable, driven by the process-factory-doc Inngest function:
//      embeds chunks in batches with retries and resume. See inngest/functions.
// ─────────────────────────────────────────────────────────────────────────────

export async function createFactoryDoc(
  tenantId: number,
  fileName: string,
  fileBuffer: Buffer
): Promise<{ docId: number; chunkCount: number; pageCount: number }> {
  // Parse first: if the PDF has no extractable text (scanned), throw before creating any
  // row so the upload surfaces a clean error instead of leaving an empty doc behind.
  const { pageCount, pages } = await extractPdfPages(fileBuffer);
  const chunks = chunkPages(pages);

  if (chunks.length === 0) {
    throw new Error("El PDF no produjo ningún fragmento indexable.");
  }

  const doc = await prisma.factoryDoc.create({
    data: {
      tenantId,
      name: fileName,
      fileSize: fileBuffer.byteLength,
      pageCount,
      chunkCount: chunks.length, // total planned; embedding happens asynchronously
      isProcessed: false,
      status: "PROCESSING",
    },
    select: { id: true },
  });

  // Bulk-insert chunk rows with embedding left NULL. The Inngest function fills embeddings.
  // Insert in batches to keep each statement small for the Neon driver.
  const DB_INSERT_BATCH = 500;
  for (let i = 0; i < chunks.length; i += DB_INSERT_BATCH) {
    const slice = chunks.slice(i, i + DB_INSERT_BATCH);
    await prisma.factoryDocChunk.createMany({
      data: slice.map((c) => ({
        tenantId,
        docId: doc.id,
        content: c.content,
        pageNum: c.pageNum,
        chunkIdx: c.chunkIdx,
      })),
    });
  }

  return { docId: doc.id, chunkCount: chunks.length, pageCount };
}

/**
 * Embed the next batch of not-yet-embedded chunks for a document. Idempotent and
 * resumable: it only touches chunks whose embedding IS NULL, so a retried Inngest step
 * skips the ones an earlier attempt already completed.
 */
export async function embedPendingChunks(
  docId: number,
  batchSize: number = EMBED_BATCH_SIZE
): Promise<{ processed: number; remaining: number }> {
  const pending = await prisma.$queryRaw<Array<{ id: number; content: string }>>`
    SELECT id, content
    FROM factory_doc_chunks
    WHERE "docId" = ${docId} AND embedding IS NULL
    ORDER BY "chunkIdx"
    LIMIT ${batchSize}
  `;

  if (pending.length === 0) return { processed: 0, remaining: 0 };

  const embeddings = await generateEmbeddings(pending.map((c) => c.content));

  // Single UPDATE ... FROM (VALUES ...) per batch instead of one round-trip per chunk.
  const rows = pending.map(
    (c, i) => Prisma.sql`(${c.id}::int, ${embeddingToSql(embeddings[i])})`
  );
  await prisma.$executeRaw`
    UPDATE factory_doc_chunks AS c
    SET embedding = v.emb::vector
    FROM (VALUES ${Prisma.join(rows)}) AS v(id, emb)
    WHERE c.id = v.id
  `;

  const remaining = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM factory_doc_chunks
    WHERE "docId" = ${docId} AND embedding IS NULL
  `;

  return { processed: pending.length, remaining: Number(remaining[0]?.count ?? 0) };
}

export async function markDocIndexed(docId: number): Promise<void> {
  const embedded = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM factory_doc_chunks
    WHERE "docId" = ${docId} AND embedding IS NOT NULL
  `;
  await prisma.factoryDoc.update({
    where: { id: docId },
    data: {
      isProcessed: true,
      status: "INDEXED",
      error: null,
      chunkCount: Number(embedded[0]?.count ?? 0),
    },
  });
}

export async function markDocFailed(docId: number, message: string): Promise<void> {
  await prisma.factoryDoc.update({
    where: { id: docId },
    data: { status: "FAILED", isProcessed: false, error: message },
  });
}

export async function deleteFactoryDoc(docId: number, tenantId: number): Promise<void> {
  // Chunks cascade-delete via FK
  await prisma.factoryDoc.deleteMany({ where: { id: docId, tenantId } });
}
