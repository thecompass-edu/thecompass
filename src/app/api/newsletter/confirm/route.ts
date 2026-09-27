import {
  createHash,
} from "crypto";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_PATTERN =
  /^[a-f0-9]{64}$/i;

function hashToken(
  token: string,
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function redirectWithStatus(
  request: NextRequest,
  status:
    | "success"
    | "expired"
    | "invalid"
    | "error",
) {
  const url =
    new URL(
      "/newsletter/confirmed",
      request.url,
    );

  url.searchParams.set(
    "status",
    status,
  );

  const response =
    NextResponse.redirect(url);

  response.headers.set(
    "Cache-Control",
    "no-store",
  );

  return response;
}

export async function GET(
  request: NextRequest,
) {
  const token =
    request.nextUrl.searchParams
      .get("token")
      ?.trim();

  if (
    !token ||
    !TOKEN_PATTERN.test(token)
  ) {
    return redirectWithStatus(
      request,
      "invalid",
    );
  }

  const tokenHash =
    hashToken(token);

  const supabase =
    createAdminClient();

  const {
    data: subscriber,
    error: lookupError,
  } = await supabase
    .from(
      "newsletter_subscribers",
    )
    .select(
      "id, status, confirmation_expires_at",
    )
    .eq(
      "confirmation_token_hash",
      tokenHash,
    )
    .maybeSingle();

  if (lookupError) {
    console.error(
      "NEWSLETTER CONFIRM LOOKUP ERROR:",
      lookupError,
    );

    return redirectWithStatus(
      request,
      "error",
    );
  }

  if (!subscriber) {
    return redirectWithStatus(
      request,
      "invalid",
    );
  }

  if (
    subscriber.status !==
    "pending"
  ) {
    return redirectWithStatus(
      request,
      "invalid",
    );
  }

  const expiresAt =
    subscriber.confirmation_expires_at
      ? new Date(
          subscriber.confirmation_expires_at,
        ).getTime()
      : Number.NaN;

  if (
    !Number.isFinite(
      expiresAt,
    ) ||
    expiresAt <= Date.now()
  ) {
    const {
      error: cleanupError,
    } = await supabase
      .from(
        "newsletter_subscribers",
      )
      .update({
        confirmation_token_hash:
          null,
        confirmation_expires_at:
          null,
      })
      .eq(
        "id",
        subscriber.id,
      );

    if (cleanupError) {
      console.error(
        "NEWSLETTER EXPIRED TOKEN CLEANUP ERROR:",
        cleanupError,
      );
    }

    return redirectWithStatus(
      request,
      "expired",
    );
  }

  const {
    error: confirmError,
  } = await supabase
    .from(
      "newsletter_subscribers",
    )
    .update({
      status: "active",
      confirmed_at:
        new Date().toISOString(),
      confirmation_token_hash:
        null,
      confirmation_expires_at:
        null,
    })
    .eq(
      "id",
      subscriber.id,
    )
    .eq(
      "status",
      "pending",
    );

  if (confirmError) {
    console.error(
      "NEWSLETTER CONFIRM UPDATE ERROR:",
      confirmError,
    );

    return redirectWithStatus(
      request,
      "error",
    );
  }

  return redirectWithStatus(
    request,
    "success",
  );
}
