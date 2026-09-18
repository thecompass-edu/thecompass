"use server";

import {
  createHash,
  randomBytes,
} from "crypto";

import {
  headers,
} from "next/headers";

import { Resend } from "resend";

import { createAdminClient } from "@/lib/supabase/admin";

const MAX_EMAIL_LENGTH = 254;
const CONFIRMATION_TTL_MS =
  24 * 60 * 60 * 1000;

const RATE_LIMIT_WINDOW_MS =
  10 * 60 * 1000;

const RATE_LIMIT_MAX_ATTEMPTS = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalNewsletterRateLimit =
  globalThis as typeof globalThis & {
    __compassNewsletterRateLimit?: Map<
      string,
      RateLimitEntry
    >;
  };

const rateLimitStore =
  globalNewsletterRateLimit.__compassNewsletterRateLimit ??
  new Map<string, RateLimitEntry>();

if (
  !globalNewsletterRateLimit.__compassNewsletterRateLimit
) {
  globalNewsletterRateLimit.__compassNewsletterRateLimit =
    rateLimitStore;
}

export type SubscribeState = {
  status:
    | "idle"
    | "success"
    | "error";
  message: string;
};

function normalizeEmail(
  value: FormDataEntryValue | null,
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

function isValidEmail(
  email: string,
) {
  if (
    !email ||
    email.length >
      MAX_EMAIL_LENGTH ||
    /[\r\n\0]/.test(email)
  ) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

function hashToken(
  token: string,
) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function createConfirmationToken() {
  const token =
    randomBytes(32).toString(
      "hex",
    );

  return {
    token,
    tokenHash:
      hashToken(token),
  };
}

function getClientIp(
  requestHeaders: Awaited<
    ReturnType<typeof headers>
  >,
) {
  const forwardedFor =
    requestHeaders.get(
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
    requestHeaders.get(
      "x-real-ip",
    ) ?? "unknown"
  );
}

function isRateLimited(
  key: string,
) {
  const now = Date.now();

  if (
    rateLimitStore.size >
    1000
  ) {
    for (const [
      storedKey,
      entry,
    ] of rateLimitStore) {
      if (
        entry.resetAt <= now
      ) {
        rateLimitStore.delete(
          storedKey,
        );
      }
    }
  }

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

    return false;
  }

  if (
    current.count >=
    RATE_LIMIT_MAX_ATTEMPTS
  ) {
    return true;
  }

  current.count += 1;

  rateLimitStore.set(
    key,
    current,
  );

  return false;
}

async function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim()
      .replace(/\/+$/, "");

  if (configuredUrl) {
    return configuredUrl;
  }

  const requestHeaders =
    await headers();

  const host =
    requestHeaders.get(
      "x-forwarded-host",
    ) ??
    requestHeaders.get(
      "host",
    );

  if (!host) {
    throw new Error(
      "Could not determine site URL.",
    );
  }

  const forwardedProtocol =
    requestHeaders
      .get(
        "x-forwarded-proto",
      )
      ?.split(",")[0]
      ?.trim();

  const protocol =
    forwardedProtocol ||
    (host.startsWith(
      "localhost",
    )
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

function buildConfirmationEmail(
  confirmationUrl: string,
) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#F8F5EC;font-family:Georgia,serif;color:#27430D;">
        <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
          <div style="background:#ffffff;border:1px solid rgba(39,67,13,0.16);padding:36px;">
            <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#687704;">
              The Compass
            </p>

            <h1 style="margin:0 0 18px;font-size:30px;line-height:1.15;color:#27430D;">
              Confirm your subscription
            </h1>

            <p style="margin:0 0 26px;font-size:16px;line-height:1.7;color:#523A23;">
              Confirm your email to receive new articles and financial literacy insights from The Compass.
            </p>

            <a
              href="${confirmationUrl}"
              style="display:inline-block;background:#27430D;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:16px;font-weight:700;"
            >
              Confirm subscription
            </a>

            <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#7B886C;">
              This link expires in 24 hours. If you did not request this subscription, you can ignore this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function subscribeToNewsletter(
  _previousState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const honeypot =
    formData.get(
      "website_url",
    );

  // Bots often fill fields that real users never see.
  if (
    typeof honeypot ===
      "string" &&
    honeypot.trim()
  ) {
    return {
      status: "success",
      message:
        "Check your inbox to confirm your subscription.",
    };
  }

  const email =
    normalizeEmail(
      formData.get("email"),
    );

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message:
        "Please enter a valid email address.",
    };
  }

  const requestHeaders =
    await headers();

  const ip =
    getClientIp(
      requestHeaders,
    );

  if (
    isRateLimited(
      `newsletter:${ip}`,
    )
  ) {
    return {
      status: "error",
      message:
        "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error(
      "Missing RESEND_API_KEY environment variable.",
    );

    return {
      status: "error",
      message:
        "We couldn't send the confirmation email right now. Please try again later.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    data: existingSubscriber,
    error: lookupError,
  } = await supabase
    .from(
      "newsletter_subscribers",
    )
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "NEWSLETTER LOOKUP ERROR:",
      lookupError,
    );

    return {
      status: "error",
      message:
        "We couldn't process your subscription right now. Please try again later.",
    };
  }

  // Do not reveal whether an address is already subscribed.
  if (
    existingSubscriber?.status ===
    "active"
  ) {
    return {
      status: "success",
      message:
        "Check your inbox to confirm your subscription.",
    };
  }

  const {
    token,
    tokenHash,
  } = createConfirmationToken();

  const expiresAt =
    new Date(
      Date.now() +
        CONFIRMATION_TTL_MS,
    ).toISOString();

  if (existingSubscriber) {
    const { error: updateError } =
      await supabase
        .from(
          "newsletter_subscribers",
        )
        .update({
          status: "pending",
          confirmation_token_hash:
            tokenHash,
          confirmation_expires_at:
            expiresAt,
          confirmed_at: null,
        })
        .eq(
          "id",
          existingSubscriber.id,
        );

    if (updateError) {
      console.error(
        "NEWSLETTER PENDING UPDATE ERROR:",
        updateError,
      );

      return {
        status: "error",
        message:
          "We couldn't process your subscription right now. Please try again later.",
      };
    }
  } else {
    const { error: insertError } =
      await supabase
        .from(
          "newsletter_subscribers",
        )
        .insert({
          email,
          status: "pending",
          confirmation_token_hash:
            tokenHash,
          confirmation_expires_at:
            expiresAt,
          confirmed_at: null,
        });

    if (insertError) {
      if (
        insertError.code ===
        "23505"
      ) {
        return {
          status: "success",
          message:
            "Check your inbox to confirm your subscription.",
        };
      }

      console.error(
        "NEWSLETTER PENDING INSERT ERROR:",
        insertError,
      );

      return {
        status: "error",
        message:
          "We couldn't process your subscription right now. Please try again later.",
      };
    }
  }

  let siteUrl: string;

  try {
    siteUrl =
      await getSiteUrl();
  } catch (error) {
    console.error(
      "NEWSLETTER SITE URL ERROR:",
      error,
    );

    return {
      status: "error",
      message:
        "We couldn't send the confirmation email right now. Please try again later.",
    };
  }

  const confirmationUrl =
    `${siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(
      token,
    )}`;

  const resend =
    new Resend(
      resendApiKey,
    );

  const from =
    process.env.NEWSLETTER_FROM_EMAIL ??
    "The Compass <onboarding@resend.dev>";

  const {
    error: sendError,
  } = await resend.emails.send(
    {
      from,
      to: email,
      subject:
        "Confirm your subscription to The Compass",
      html:
        buildConfirmationEmail(
          confirmationUrl,
        ),
    },
    {
      idempotencyKey:
        `newsletter-confirmation/${tokenHash}`,
    },
  );

  if (sendError) {
    console.error(
      "NEWSLETTER EMAIL ERROR:",
      sendError,
    );

    return {
      status: "error",
      message:
        "We couldn't send the confirmation email right now. Please try again later.",
    };
  }

  return {
    status: "success",
    message:
      "Check your inbox to confirm your subscription.",
  };
}
