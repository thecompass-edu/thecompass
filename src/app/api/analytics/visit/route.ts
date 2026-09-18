import { createAdminClient } from "@/lib/supabase/admin";
import {
  analyticsJson,
  getCountryCode,
  hasOnlyKeys,
  isUuid,
  protectAnalyticsRequest,
  readAnalyticsJson,
} from "@/lib/security/analyticsRequest";

export async function POST(
  request: Request,
) {
  const blocked =
    protectAnalyticsRequest(
      request,
    );

  if (blocked) {
    return blocked;
  }

  const bodyResult =
    await readAnalyticsJson(
      request,
    );

  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.data;

  if (
    !hasOnlyKeys(body, [
      "visitorId",
      "sessionId",
    ])
  ) {
    return analyticsJson(
      {
        error:
          "Invalid request body.",
      },
      400,
    );
  }

  const {
    visitorId,
    sessionId,
  } = body;

  if (
    !isUuid(visitorId) ||
    !isUuid(sessionId)
  ) {
    return analyticsJson(
      {
        error:
          "Invalid analytics identifiers.",
      },
      400,
    );
  }

  const supabase =
    createAdminClient();

  const { error } =
    await supabase
      .from("site_visits")
      .insert({
        visitor_id:
          visitorId,
        session_id:
          sessionId,
        country_code:
          getCountryCode(
            request,
          ),
      });

  if (error) {
    // This session was already counted.
    if (
      error.code === "23505"
    ) {
      return analyticsJson({
        ok: true,
      });
    }

    console.error(
      "SITE VISIT INSERT ERROR:",
      error,
    );

    return analyticsJson(
      {
        error:
          "Unable to record visit.",
      },
      500,
    );
  }

  return analyticsJson({
    ok: true,
  });
}
