// PDF text extraction for the factory-manual RAG pipeline.
//
// Wraps pdf-parse v2 (the `PDFParse` class API) and returns text **per page** so the
// ingestion pipeline can preserve page numbers for citations and chunk page-by-page.
// pdf-parse's `lineEnforce` + `cellSeparator` keep line and column structure, which is
// what lets the chunker avoid splitting tables (torques, error codes, parts) mid-row.

export interface PdfPage {
  num: number; // 1-based physical page number
  text: string;
}

export interface ParsedPdf {
  pageCount: number;
  pages: PdfPage[];
}

/**
 * Thrown when a PDF yields no extractable text — almost always an image-only scan.
 * This is the seam where OCR would plug in (Claude vision / cloud OCR); for now scanned
 * PDFs are rejected with a clear message instead of being silently half-indexed.
 */
export class ScannedPdfError extends Error {
  constructor() {
    super(
      "El PDF no tiene texto extraíble. Los PDFs escaneados (solo imágenes) no están soportados aún."
    );
    this.name = "ScannedPdfError";
  }
}

// Minimal shape of the bits of pdf-parse v2 we use. Declared locally so we don't depend
// on the package's exported typings resolving through its CJS build.
interface PdfParseModule {
  PDFParse: new (opts: { data: Uint8Array }) => {
    getText(params?: Record<string, unknown>): Promise<{
      total: number;
      pages: Array<{ num: number; text: string }>;
    }>;
    destroy(): Promise<void>;
  };
}

export async function extractPdfPages(buffer: Buffer): Promise<ParsedPdf> {
  // Lazy require: pdf-parse pulls in pdfjs-dist, which reaches for DOM-ish globals at
  // module-load time and crashes Next's build-time page-data collection if imported at
  // the top of a module. Requiring it inside the function keeps it out of the build graph.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PDFParse } = require("pdf-parse") as PdfParseModule;

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText({
      // Insert a newline between visually separate lines so paragraph/table structure
      // survives into the chunker instead of collapsing into one run-on line.
      lineEnforce: true,
      // Tab-separate cells on the same baseline — keeps table columns readable.
      cellSeparator: "\t",
      // We track pages via `num`; no in-text "-- page x of y --" marker needed.
      pageJoiner: "",
    });

    const pages: PdfPage[] = result.pages
      .map((p) => ({ num: p.num, text: normalizePageText(p.text) }))
      .filter((p) => p.text.length > 0);

    const hasText = pages.some((p) => p.text.replace(/\s/g, "").length > 0);
    if (!hasText) throw new ScannedPdfError();

    return { pageCount: result.total || pages.length, pages };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

function normalizePageText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "")) // trim trailing whitespace per line
    .join("\n")
    .replace(/\n{3,}/g, "\n\n") // collapse big vertical gaps
    .trim();
}
