type WidgetDomainAccessParams = {
  request: Request;
  allowedDomains: string[];
};

function normalizeHostname(value: string) {
  const normalizedValue = value
    .trim()
    .toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  try {
    const url = new URL(
      normalizedValue.includes("://")
        ? normalizedValue
        : `https://${normalizedValue}`,
    );

    return url.hostname
      .replace(/\.$/, "")
      .toLowerCase();
  } catch {
    return normalizedValue
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      ?.split(":")[0]
      ?.replace(/\.$/, "")
      .toLowerCase() || null;
  }
}

function getRequestHostname(
  request: Request,
) {
  const origin = request.headers.get("origin");

  if (origin && origin !== "null") {
    try {
      return new URL(origin).hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  const referer = request.headers.get("referer");

  if (referer) {
    try {
      return new URL(referer).hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  return null;
}

function domainMatches(
  hostname: string,
  allowedDomain: string,
) {
  const normalizedAllowedDomain =
    normalizeHostname(allowedDomain);

  if (!normalizedAllowedDomain) {
    return false;
  }

  if (
    normalizedAllowedDomain === "localhost"
  ) {
    return hostname === "localhost";
  }

  if (
    normalizedAllowedDomain.startsWith("*.")
  ) {
    const baseDomain =
      normalizedAllowedDomain.slice(2);

    return (
      hostname !== baseDomain &&
      hostname.endsWith(`.${baseDomain}`)
    );
  }

  return hostname === normalizedAllowedDomain;
}

export function isWidgetRequestAllowed({
  request,
  allowedDomains,
}: WidgetDomainAccessParams) {
  const normalizedAllowedDomains =
    allowedDomains
      .map(normalizeHostname)
      .filter(
        (domain): domain is string =>
          Boolean(domain),
      );

  if (normalizedAllowedDomains.length === 0) {
    return {
      allowed: true as const,
      hostname: getRequestHostname(request),
      reason: "NO_RESTRICTIONS" as const,
    };
  }

  const hostname = getRequestHostname(request);

  if (!hostname) {
    return {
      allowed: false as const,
      hostname: null,
      reason: "ORIGIN_MISSING" as const,
    };
  }

  const allowed =
    normalizedAllowedDomains.some(
      (allowedDomain) =>
        domainMatches(
          hostname,
          allowedDomain,
        ),
    );

  return {
    allowed,
    hostname,
    reason: allowed
      ? ("DOMAIN_ALLOWED" as const)
      : ("DOMAIN_NOT_ALLOWED" as const),
  };
}
