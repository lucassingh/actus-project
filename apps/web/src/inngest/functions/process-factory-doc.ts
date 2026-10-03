import * as Sentry from "@sentry/nextjs";
import { inngest } from "../client";
import { factoryDocUploaded } from "../events";
import {
  embedPendingChunks,
  markDocIndexed,
  markDocFailed,
  EMBED_BATCH_SIZE,
} from "@/services/factory-doc.service";

// Upper bound on batches so a pathological document can't loop forever.
// MAX_BATCHES * EMBED_BATCH_SIZE chunks is far more than any real manual produces.
const MAX_BATCHES = 100;

/**
 * Durable embedding of an uploaded factory manual. The upload path already parsed the PDF
 * and stored the chunk rows (text, no embedding); this function fills the embeddings in
 * batches. Each batch is its own Inngest step, so a transient OpenAI failure retries just
 * that batch and resumes — a long manual never has to start over, and the upload request
 * never blocks on embedding. `onFailure` marks the document FAILED so the dashboard stops
 * showing it as "processing" forever.
 */
export const processFactoryDoc = inngest.createFunction(
  {
    id: "process-factory-doc",
    retries: 3,
    // Cap concurrent embedding runs so several uploads at once don't hammer the OpenAI
    // embeddings rate limit.
    concurrency: { limit: 3 },
    triggers: [{ event: factoryDocUploaded }],
    onFailure: async ({ event, error }) => {
      const { docId, tenantId } = event.data.event.data;
      Sentry.captureException(error, {
        tags: { flow: "factory-doc" },
        extra: { docId, tenantId },
      });
      console.error("[factory-doc] ingestion failed after retries", {
        docId,
        error: error?.message,
      });
      try {
        await markDocFailed(
          docId,
          "No se pudo indexar el documento. Eliminalo y volvé a subirlo."
        );
      } catch (err) {
        console.error("[factory-doc] could not mark doc as failed", err);
      }
    },
  },
  async ({ event, step }) => {
    const { docId } = event.data;

    let embedded = 0;
    for (let i = 0; i < MAX_BATCHES; i++) {
      const { processed, remaining } = await step.run(`embed-batch-${i}`, () =>
        embedPendingChunks(docId, EMBED_BATCH_SIZE)
      );
      embedded += processed;
      if (remaining === 0) break;
    }

    await step.run("finalize", () => markDocIndexed(docId));

    return { docId, embedded };
  }
);
