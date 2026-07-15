const REQUEST_TIMEOUT = 15_000;

type FetchWebsiteParams = {
  url: string;
};

export async function fetchWebsite({
  url,
}: FetchWebsiteParams): Promise<string> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "SelloraBot/1.0 (+https://sellora.ai)",
        Accept:
          "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Website returned HTTP ${response.status}.`,
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      throw new Error(
        "The provided URL does not return HTML.",
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}