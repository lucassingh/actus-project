// Structure-aware chunking for factory manuals.
//
// Replaces the previous approach (flatten the whole document to a single line with
// `\s+ → " "`, then cut every N words) which broke tables and procedures mid-row and
// dropped the trailing remainder. Instead we chunk **within each page** (so every chunk
// has an exact page number for citations) and **only ever break at line boundaries**, so
// a table's rows stay contiguous until a chunk fills up.
//
// Pure and deterministic — unit-testable without a DB or network.

import type { PdfPage } from "./pdf";

export interface DocChunk {
  content: string;
  pageNum: number;
  chunkIdx: number; // global, document-wide order
}

// Sizes are in characters. text-embedding-3-small handles these comfortably
// (lib/embeddings caps input at 8000 chars, well above MAX_CHARS).
const TARGET_CHARS = 1800; // aim for chunks around this size
const MAX_CHARS = 2600; // a single over-long line is hard-split beyond this
const OVERLAP_CHARS = 200; // carry context across the boundary between chunks
const MIN_CHARS = 40; // drop sub-fragments shorter than this (page footers, stray glyphs)

export function chunkPages(pages: PdfPage[]): DocChunk[] {
  const chunks: DocChunk[] = [];
  let idx = 0;
  for (const page of pages) {
    for (const content of chunkOnePage(page.text)) {
      chunks.push({ content, pageNum: page.num, chunkIdx: idx++ });
    }
  }
  return chunks;
}

function chunkOnePage(pageText: string): string[] {
  const text = pageText.trim();
  if (!text) return [];

  const lines = text.split("\n");
  const out: string[] = [];
  let buf: string[] = [];
  let bufLen = 0;

  const flush = () => {
    const content = buf.join("\n").trim();
    // Keep a short page if it's the only thing on it; otherwise skip noise fragments.
    if (content.length >= MIN_CHARS || (content.length > 0 && out.length === 0)) {
      out.push(content);
    }
  };

  for (const line of lines) {
    // A single line longer than MAX_CHARS (e.g. a giant borderless table row, or text
    // with no spaces) can't be packed — flush what we have and hard-split it.
    if (line.length > MAX_CHARS) {
      if (buf.length) {
        flush();
        buf = [];
        bufLen = 0;
      }
      for (const piece of hardSplit(line, MAX_CHARS)) out.push(piece);
      continue;
    }

    const addLen = line.length + 1; // +1 for the joining newline
    if (bufLen + addLen > TARGET_CHARS && buf.length > 0) {
      flush();
      // Seed the next chunk with the tail of this one so context carries over.
      const overlap = takeOverlap(buf, OVERLAP_CHARS);
      buf = overlap.slice();
      bufLen = overlap.reduce((n, l) => n + l.length + 1, 0);
    }

    buf.push(line);
    bufLen += addLen;
  }

  if (buf.length) flush();
  return out;
}

// Take whole trailing lines totalling up to ~maxChars, preserving their order.
function takeOverlap(lines: string[], maxChars: number): string[] {
  const picked: string[] = [];
  let total = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (total + l.length > maxChars && picked.length > 0) break;
    picked.unshift(l);
    total += l.length + 1;
  }
  return picked;
}

function hardSplit(s: string, size: number): string[] {
  const pieces: string[] = [];
  for (let i = 0; i < s.length; i += size) pieces.push(s.slice(i, i + size));
  return pieces;
}
