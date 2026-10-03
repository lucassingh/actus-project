import { describe, it, expect } from "vitest";
import { chunkPages } from "./chunking";
import type { PdfPage } from "./pdf";

const MAX_CHARS = 2600; // mirrors the hard-split cap in chunking.ts

describe("chunkPages", () => {
  it("keeps table rows contiguous in a single chunk (no mid-row split)", () => {
    const table = [
      "Codigo\tTorque\tRepuesto",
      "A-01\t50 Nm\tJ-200",
      "A-02\t75 Nm\tJ-201",
      "A-03\t90 Nm\tJ-202",
    ].join("\n");
    const chunks = chunkPages([{ num: 7, text: `Tabla de torques\n${table}` }]);

    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageNum).toBe(7);
    // Every row survives intact and in order.
    for (const row of table.split("\n")) {
      expect(chunks[0].content).toContain(row);
    }
  });

  it("carries the page number onto every chunk and numbers chunks globally", () => {
    const pages: PdfPage[] = [
      { num: 1, text: "Primera pagina." },
      { num: 2, text: "Segunda pagina." },
      { num: 3, text: "Tercera pagina." },
    ];
    const chunks = chunkPages(pages);

    expect(chunks.map((c) => c.pageNum)).toEqual([1, 2, 3]);
    expect(chunks.map((c) => c.chunkIdx)).toEqual([0, 1, 2]);
  });

  it("never lets a chunk span two pages", () => {
    const pages: PdfPage[] = [
      { num: 1, text: "AAA contenido de la pagina uno." },
      { num: 2, text: "BBB contenido de la pagina dos." },
    ];
    const chunks = chunkPages(pages);
    for (const c of chunks) {
      if (c.pageNum === 1) expect(c.content).not.toContain("BBB");
      if (c.pageNum === 2) expect(c.content).not.toContain("AAA");
    }
  });

  it("splits a long page into several chunks with line overlap", () => {
    // Lines have no trailing whitespace — that's the contract chunkPages gets from
    // normalizePageText (lib/pdf.ts), and it's what makes the overlap line-exact.
    const lines = Array.from(
      { length: 40 },
      (_, i) => `Linea ${i + 1}: ` + Array(12).fill("contenido").join(" ")
    );
    const chunks = chunkPages([{ num: 1, text: lines.join("\n") }]);

    expect(chunks.length).toBeGreaterThan(1);
    // The last line of a chunk reappears as the first line of the next (overlap).
    for (let i = 0; i < chunks.length - 1; i++) {
      const lastLine = chunks[i].content.split("\n").at(-1);
      const firstLineNext = chunks[i + 1].content.split("\n")[0];
      expect(firstLineNext).toBe(lastLine);
    }
  });

  it("hard-splits a single over-long line and respects the max size", () => {
    const giant = "X".repeat(6000); // no spaces, longer than MAX_CHARS
    const chunks = chunkPages([{ num: 1, text: giant }]);

    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.content.length).toBeLessThanOrEqual(MAX_CHARS);
    }
  });

  it("keeps a tiny page as its own chunk", () => {
    const chunks = chunkPages([{ num: 5, text: "Nota." }]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ pageNum: 5, content: "Nota." });
  });

  it("ignores empty pages", () => {
    const chunks = chunkPages([
      { num: 1, text: "   \n  \n" },
      { num: 2, text: "Contenido real." },
    ]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageNum).toBe(2);
  });

  it("returns nothing for no pages", () => {
    expect(chunkPages([])).toEqual([]);
  });
});
