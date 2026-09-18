import "server-only";

const MAX_BODY_BYTES = 2048;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalAnalyticsRateLimit =
  globalThis as typeof globalThis & {
    __compassAnalyticsRateLimit?: Map<
      string,
      RateLimitEntry
    >;
  };

const rateLimitStore =
  globalAnalyticsRateLimit.__compassAnalyticsRateLimit ??
  new Map<string, RateLimitEntry>();

if (
  !globalAnalyticsRateLimit.__compassAnalyticsRateLimit
) {
  globalAnalyticsRateLimit.__compassAnalyticsRateLimit =
    rateLimitStore;
}

export function analyticsJson(
  body: unknown,
  status = 200,
  headers?: HeadersInit,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function getClientIp(
  request: Request,
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim() || "unknown"
    );
  }

  return (
    request.headers.get(
      "x-real-ip",
    ) ?? "unknown"
  );
}

function getExpectedHost(
  request: Request,
) {
  const forwardedHost =
    request.headers.get(
      "x-forwarded-host",
    );

  const host =
    forwardedHost ??
    request.headers.get("host") ??
    new URL(request.url).host;

  return (
    host
      .split(",")[0]
      ?.trim()
      .toLowerCase() ?? ""
  );
}

function isSameOrigin(
  request: Request,
) {
  const origin =
    request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    const originHost =
      new URL(origin).host.toLowerCase();

    return (
      originHost ===
      getExpectedHost(request)
    );
  } catch {
    return false;
  }
}

function getRetryAfter(
  request: Request,
) {
  const now = Date.now();

  if (rateLimitStore.size > 2000) {
    for (const [
      key,
      entry,
    ] of rateLimitStore) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const pathname =
    new URL(request.url).pathname;

  const key = `${pathname}:${getClientIp(
    request,
  )}`;

  const current =
    rateLimitStore.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt:
        now +
        RATE_LIMIT_WINDOW_MS,
    });

    return null;
  }

  if (
    current.count >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return Math.max(
      1,
      Math.ceil(
        (current.resetAt - now) /
          1000,
      ),
    );
  }

  current.count += 1;
  rateLimitStore.set(
    key,
    current,
  );

  return null;
}

export function protectAnalyticsRequest(
  request: Request,
) {
  if (
    request.method !== "POST"
  ) {
    return analyticsJson(
      {
        error:
          "Method not allowed.",
      },
      405,
      {
        Allow: "POST",
      },
    );
  }

  if (!isSameOrigin(request)) {
    return analyticsJson(
      {
        error:
          "Request not allowed.",
      },
      403,
    );
  }

  const contentType =
    request.headers
      .get("content-type")
      ?.toLowerCase();

  if (
    !contentType?.startsWith(
      "application/json",
    )
  ) {
    return analyticsJson(
      {
        error:
          "JSON content is required.",
      },
      415,
    );
  }

  const contentLength =
    request.headers.get(
      "content-length",
    );

  if (contentLength) {
    const parsedLength =
      Number(contentLength);

    if (
      !Number.isFinite(
        parsedLength,
      ) ||
      parsedLength < 0 ||
      parsedLength >
        MAX_BODY_BYTES
    ) {
      return analyticsJson(
        {
          error:
            "Request body is too large.",
        },
        413,
      );
    }
  }

  const retryAfter =
    getRetryAfter(request);

  if (retryAfter !== null) {
    return analyticsJson(
      {
        error:
          "Too many requests.",
      },
      429,
      {
        "Retry-After":
          String(retryAfter),
      },
    );
  }

  return null;
}

export async function readAnalyticsJson(
  request: Request,
) {
  let rawBody: string;

  try {
    rawBody =
      await request.text();
  } catch {
    return {
      ok: false as const,
      response: analyticsJson(
        {
          error:
            "Invalid request body.",
        },
        400,
      ),
    };
  }

  const bodySize =
    new TextEncoder().encode(
      rawBody,
    ).byteLength;

  if (
    bodySize === 0 ||
    bodySize >
      MAX_BODY_BYTES
  ) {
    return {
      ok: false as const,
      response: analyticsJson(
        {
          error:
            bodySize === 0
              ? "Request body is required."
              : "Request body is too large.",
        },
        bodySize === 0
          ? 400
          : 413,
      ),
    };
  }

  try {
    const data =
      JSON.parse(rawBody);

    if (
      typeof data !== "object" ||
      data === null ||
      Array.isArray(data)
    ) {
      throw new Error(
        "Invalid JSON object.",
      );
    }

    return {
      ok: true as const,
      data: data as Record<
        string,
        unknown
      >,
    };
  } catch {
    return {
      ok: false as const,
      response: analyticsJson(
        {
          error:
            "Invalid JSON body.",
        },
        400,
      ),
    };
  }
}

export function isUuid(
  value: unknown,
): value is string {
  if (
    typeof value !== "string" ||
    value.length > 36
  ) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function hasOnlyKeys(
  data: Record<
    string,
    unknown
  >,
  allowedKeys: string[],
) {
  return Object.keys(data).every(
    (key) =>
      allowedKeys.includes(key),
  );
}

export function getCountryCode(
  request: Request,
) {
  const country =
    request.headers
      .get(
        "x-vercel-ip-country",
      )
      ?.trim()
      .toUpperCase();

  if (
    !country ||
    !/^[A-Z]{2}$/.test(
      country,
    )
  ) {
    return "Unknown";
  }

  return country;
}
