const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

type ChunkTextOptions = {
  chunkSize?: number;
  overlap?: number;
};

export type TextChunk = {
  index: number;
  content: string;
  characterCount: number;
};

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findChunkEnd(
  text: string,
  start: number,
  preferredEnd: number,
) {
  if (preferredEnd >= text.length) {
    return text.length;
  }

  const minimumEnd = start + Math.floor((preferredEnd - start) * 0.6);

  const paragraphBreak = text.lastIndexOf("\n\n", preferredEnd);

  if (paragraphBreak >= minimumEnd) {
    return paragraphBreak;
  }

  const sentenceBreak = Math.max(
    text.lastIndexOf(". ", preferredEnd),
    text.lastIndexOf("! ", preferredEnd),
    text.lastIndexOf("? ", preferredEnd),
  );

  if (sentenceBreak >= minimumEnd) {
    return sentenceBreak + 1;
  }

  const wordBreak = text.lastIndexOf(" ", preferredEnd);

  if (wordBreak >= minimumEnd) {
    return wordBreak;
  }

  return preferredEnd;
}

export function chunkText(
  input: string,
  options: ChunkTextOptions = {},
): TextChunk[] {
  const text = normalizeText(input);

  if (!text) {
    return [];
  }

  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP;

  if (!Number.isInteger(chunkSize) || chunkSize < 200) {
    throw new Error("Chunk size must be an integer of at least 200.");
  }

  if (!Number.isInteger(overlap) || overlap < 0) {
    throw new Error("Chunk overlap must be a non-negative integer.");
  }

  if (overlap >= chunkSize) {
    throw new Error("Chunk overlap must be smaller than chunk size.");
  }

  const chunks: TextChunk[] = [];
  let start = 0;

  while (start < text.length) {
    const preferredEnd = Math.min(start + chunkSize, text.length);
    const end = findChunkEnd(text, start, preferredEnd);

    const content = text.slice(start, end).trim();

    if (content) {
      chunks.push({
        index: chunks.length,
        content,
        characterCount: content.length,
      });
    }

    if (end >= text.length) {
      break;
    }

    const nextStart = Math.max(end - overlap, start + 1);
    start = nextStart;
  }

  return chunks;
}