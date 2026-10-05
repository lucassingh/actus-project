import { prisma } from "@/lib/prisma";

// Public image endpoint for KB reference images (F6). Public on purpose: WhatsApp (Meta) fetches
// the URL server-side with no session. Ids are sequential KB ids and the images are maintenance
// reference photos (not sensitive), so enumeration isn't a concern for the pilot.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kbId = parseInt(id, 10);
  if (isNaN(kbId)) return new Response("Not found", { status: 404 });

  const entry = await prisma.knowledgeBase.findUnique({
    where: { id: kbId },
    select: { imageData: true, imageMimeType: true },
  });
  if (!entry?.imageData || !entry.imageMimeType) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(entry.imageData);
  return new Response(bytes, {
    headers: {
      "Content-Type": entry.imageMimeType,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
