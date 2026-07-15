import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;
const MAX_HTML_SIZE_BYTES = 5 * 1024 * 1024;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

type FetchWebsiteParams = {
  url: string;
};

function isPrivateIPv4(address: string) {
  const octets = address.split(".").map(Number);

  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return true;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127) ||
    first >= 224
  );
}

function isPrivateIPv6(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

function isPrivateAddress(address: string) {
  const version = isIP(address);

  if (version === 4) {
    return isPrivateIPv4(address);
  }

  if (version === 6) {
    return isPrivateIPv6(address);
  }

  return true;
}

async function validatePublicWebsiteUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Website URL is invalid.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Website URL must use HTTP or HTTPS.");
  }

  if (url.username || url.password) {
    throw new Error("Website URL must not contain credentials.");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Private or internal website addresses are not allowed.");
  }

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error("Private or internal IP addresses are not allowed.");
    }

    return url;
  }

  const resolvedAddresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (resolvedAddresses.length === 0) {
    throw new Error("Website hostname could not be resolved.");
  }

  if (resolvedAddresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Website resolves to a private or internal IP address.");
  }

  return url;
}

async function readHtmlResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error("The provided URL does not return HTML.");
  }

  const declaredLength = Number(
    response.headers.get("content-length") ?? "0",
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_HTML_SIZE_BYTES
  ) {
    throw new Error("Website HTML is too large to process.");
  }

  const html = await response.text();

  if (Buffer.byteLength(html, "utf8") > MAX_HTML_SIZE_BYTES) {
    throw new Error("Website HTML is too large to process.");
  }

  return html;
}

export async function fetchWebsite({
  url,
}: FetchWebsiteParams): Promise<string> {
  let currentUrl = await validatePublicWebsiteUrl(url);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "SelloraBot/1.0 (+https://sellora.ai)",
          Accept: "text/html,application/xhtml+xml",
        },
        cache: "no-store",
      });

      if (
        response.status >= 300 &&
        response.status < 400
      ) {
        const location = response.headers.get("location");

        if (!location) {
          throw new Error("Website returned an invalid redirect.");
        }

        if (redirectCount === MAX_REDIRECTS) {
          throw new Error("Website returned too many redirects.");
        }

        const redirectedUrl = new URL(location, currentUrl);

        currentUrl = await validatePublicWebsiteUrl(
          redirectedUrl.toString(),
        );

        continue;
      }

      if (!response.ok) {
        throw new Error(
          `Website returned HTTP ${response.status}.`,
        );
      }

      return await readHtmlResponse(response);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error("Website request timed out.");
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Website could not be fetched.");
}