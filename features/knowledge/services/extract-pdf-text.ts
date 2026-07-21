import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { readPrivateBlob } from "@/lib/blob/blob-storage";

const MAX_PDF_PAGES = 1_000;

type ExtractPdfTextParams = {
  storageKey: string;
};

function normalizePageText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function getTextItemValue(item: unknown) {
  if (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof item.str === "string"
  ) {
    return item.str;
  }

  return "";
}

function assertPdfSignature(data: Uint8Array) {
  const signature = new TextDecoder()
    .decode(data.slice(0, 5))
    .trim();

  if (signature !== "%PDF-") {
    throw new Error(
      "The uploaded file does not have a valid PDF signature.",
    );
  }
}

export async function extractPdfText({
  storageKey,
}: ExtractPdfTextParams): Promise<string> {
  const normalizedStorageKey = storageKey.trim();

  if (!normalizedStorageKey) {
    throw new Error("PDF storage key is required.");
  }

  const pdfData = await readPrivateBlob(
    normalizedStorageKey,
  );

  assertPdfSignature(pdfData);

  const loadingTask = getDocument({
    data: pdfData,
    useSystemFonts: true,
  });

  try {
    const document = await loadingTask.promise;

    if (document.numPages === 0) {
      throw new Error("The PDF does not contain any pages.");
    }

    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `The PDF exceeds the ${MAX_PDF_PAGES}-page limit.`,
      );
    }

    const pages: string[] = [];

    for (
      let pageNumber = 1;
      pageNumber <= document.numPages;
      pageNumber += 1
    ) {
      const page = await document.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = normalizePageText(
        textContent.items
          .map(getTextItemValue)
          .filter(Boolean)
          .join(" "),
      );

      if (pageText) {
        pages.push(pageText);
      }

      page.cleanup();
    }

    const text = pages.join("\n\n").trim();

    if (!text) {
      throw new Error(
        "No selectable text was found in the PDF. The document may contain only scanned images.",
      );
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `PDF text extraction failed: ${error.message}`,
      );
    }

    throw new Error(
      "PDF text extraction failed for an unknown reason.",
    );
  } finally {
    await loadingTask.destroy();
  }
}
