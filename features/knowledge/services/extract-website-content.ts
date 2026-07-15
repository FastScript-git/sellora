import * as cheerio from "cheerio";

type ExtractWebsiteContentResult = {
  title: string | null;
  description: string | null;
  text: string;
};

const REMOVED_SELECTORS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  "nav",
  "footer",
  "form",
  "button",
  "[aria-hidden='true']",
  "[hidden]",
];

const CONTENT_SELECTORS = [
  "main",
  "article",
  "[role='main']",
  ".main-content",
  ".page-content",
  ".post-content",
  ".article-content",
];

function normalizeExtractedText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getMetaContent(
  $: cheerio.CheerioAPI,
  selectors: string[],
) {
  for (const selector of selectors) {
    const value = $(selector).first().attr("content")?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

export function extractWebsiteContent(
  html: string,
): ExtractWebsiteContentResult {
  if (!html.trim()) {
    throw new Error("Website HTML is empty.");
  }

  const $ = cheerio.load(html);

  $(REMOVED_SELECTORS.join(",")).remove();

  const title =
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    null;

  const description = getMetaContent($, [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]);

  let rawText = $("body").text();

for (const selector of CONTENT_SELECTORS) {
  const candidate = $(selector).first();

  if (candidate.length > 0) {
    rawText = candidate.text();
    break;
  }
}

  const text = normalizeExtractedText(rawText);

  if (text.length < 100) {
    throw new Error(
      "The website does not contain enough readable text.",
    );
  }

  return {
    title,
    description,
    text,
  };
}