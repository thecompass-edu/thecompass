import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type VisitBody = {
  visitorId?: string;
  sessionId?: string;
};

function getCountryCode(request: NextRequest) {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");

  if (!country) {
    return "Unknown";
  }

  return country.trim().toUpperCase();
}

export async function POST(
  request: NextRequest,
) {
  let body: VisitBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const visitorId =
    body.visitorId?.trim();

  const sessionId =
    body.sessionId?.trim();

  if (!visitorId || !sessionId) {
    return NextResponse.json(
      {
        error:
          "Visitor and session IDs are required.",
      },
      {
        status: 400,
      },
    );
  }

  const supabase =
    createAdminClient();

  // Prevent duplicate session visits.
  const {
    data: existingVisit,
    error: lookupError,
  } = await supabase
    .from("site_visits")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "VISIT LOOKUP ERROR:",
      lookupError,
    );

    return NextResponse.json(
      {
        error:
          "Unable to check visit.",
      },
      {
        status: 500,
      },
    );
  }

  if (existingVisit) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
    });
  }

  const countryCode =
    getCountryCode(request);

  const {
    data: insertedVisit,
    error: insertError,
  } = await supabase
    .from("site_visits")
    .insert({
      id: crypto.randomUUID(),
      visitor_id: visitorId,
      session_id: sessionId,
      country_code: countryCode,
      visited_at:
        new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error(
      "VISIT INSERT ERROR:",
      insertError,
    );

    return NextResponse.json(
      {
        error:
          "Unable to record visit.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    visitId: insertedVisit.id,
  });
}