import { prisma } from "@/lib/prisma";
import { generateEmbedding, embeddingToSql } from "@/lib/embeddings";

const CHUNK_WORDS = 350;   // words per chunk
const CHUNK_OVERLAP = 40;  // words overlap between consecutive chunks
const MAX_CHUNKS = 80;     // safety cap to avoid embedding API timeouts

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point — call this from the Server Action
// ─────────────────────────────────────────────────────────────────────────────

export async function ingestFactoryDocPdf(
  tenantId: number,
  fileName: string,
  fileBuffer: Buffer,
): Promise<{ docId: number; chunksCreated: number; pageCount: number }> {
  // 1. Parse PDF
  // Required lazily: pdf-parse -> pdfjs-dist tries to set up a canvas backend at
  // module load time, which crashes Next's static page-data collection (no DOM
  // globals like DOMMatrix at build time) if required at the top of this file.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const parsed = await pdfParse(fileBuffer);
  const rawText: string = parsed.text ?? "";
  const pageCount: number = parsed.numpages ?? 0;

  if (!rawText.trim()) {
    throw new Error(
      "El PDF no tiene texto extraíble. Los PDFs escaneados (solo imágenes) no están soportados aún."
    );
  }

  // 2. Create FactoryDoc record (marks as not processed yet)
  const doc = await prisma.factoryDoc.create({
    data: {
      tenantId,
      name: fileName,
      fileSize: fileBuffer.byteLength,
      pageCount,
      isProcessed: false,
    },
    select: { id: true },
  });

  // 3. Chunk the text
  const chunks = splitIntoChunks(rawText);
  const capped = chunks.slice(0, MAX_CHUNKS);

  // 4. Embed each chunk and persist
  let chunksCreated = 0;
  for (let i = 0; i < capped.length; i++) {
    const content = capped[i];
    try {
      const created = await prisma.factoryDocChunk.create({
        data: { tenantId, docId: doc.id, content, chunkIdx: i },
        select: { id: true },
      });

      const embedding = await generateEmbedding(content);
      const vector = embeddingToSql(embedding);

      await prisma.$executeRaw`
        UPDATE factory_doc_chunks
        SET embedding = ${vector}::vector
        WHERE id = ${created.id}
      `;

      chunksCreated++;
    } catch (err) {
      // If one chunk fails (e.g. embedding error), keep going with the rest
      console.error(`[factory-doc] chunk ${i} embedding failed:`, err);
    }
  }

  // 5. Mark doc as processed
  await prisma.factoryDoc.update({
    where: { id: doc.id },
    data: { isProcessed: true, chunkCount: chunksCreated },
  });

  return { docId: doc.id, chunksCreated, pageCount };
}

export async function deleteFactoryDoc(docId: number, tenantId: number): Promise<void> {
  // Chunks cascade-delete via FK
  await prisma.factoryDoc.deleteMany({ where: { id: docId, tenantId } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function splitIntoChunks(text: string): string[] {
  // Normalize whitespace: collapse multiple spaces/newlines into single space
  const normalized = text.replace(/\s+/g, " ").trim();
  const words = normalized.split(" ");

  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const slice = words.slice(i, i + CHUNK_WORDS).join(" ").trim();
    if (slice.length > 30) {
      chunks.push(slice);
    }
    i += CHUNK_WORDS - CHUNK_OVERLAP;
  }

  return chunks;
}
