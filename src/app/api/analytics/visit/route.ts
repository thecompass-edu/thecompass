import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type VisitRequestBody = {
  visitorId?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VisitRequestBody;

    const visitorId = body.visitorId;
    const sessionId = body.sessionId;

    if (!visitorId || !sessionId) {
      return NextResponse.json(
        { error: "Missing visitor or session ID." },
        { status: 400 },
      );
    }

    /*
     * Vercel provides this header in production.
     * During localhost development it may be unavailable.
     */
    const countryCode =
      request.headers.get("x-vercel-ip-country") ?? "Unknown";

    const supabase = await createClient();

    const { error } = await supabase.from("site_visits").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      country_code: countryCode,
    });

    /*
     * 23505 = unique constraint violation.
     *
     * This simply means this session was already recorded,
     * so we don't treat it as an application error.
     */
    if (error && error.code !== "23505") {
      console.error("SITE VISIT TRACKING ERROR:", error);

      return NextResponse.json(
        { error: "Unable to record visit." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("SITE VISIT API ERROR:", error);

    return NextResponse.json(
      { error: "Unable to record visit." },
      { status: 500 },
    );
  }
}