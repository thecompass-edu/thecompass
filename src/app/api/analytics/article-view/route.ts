import { createAdminClient } from "@/lib/supabase/admin";
import {
  analyticsJson,
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
      "articleId",
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
    articleId,
    visitorId,
    sessionId,
  } = body;

  if (
    !isUuid(articleId) ||
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

  const {
    data: article,
    error: articleError,
  } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .eq(
      "status",
      "published",
    )
    .maybeSingle();

  if (articleError) {
    console.error(
      "ARTICLE VIEW LOOKUP ERROR:",
      articleError,
    );

    return analyticsJson(
      {
        error:
          "Unable to record article view.",
      },
      500,
    );
  }

  if (!article) {
    return analyticsJson(
      {
        error:
          "Article not found.",
      },
      404,
    );
  }

  const { error } =
    await supabase
      .from("article_views")
      .insert({
        article_id:
          articleId,
        visitor_id:
          visitorId,
        session_id:
          sessionId,
      });

  if (error) {
    // This article was already counted for this session.
    if (
      error.code === "23505"
    ) {
      return analyticsJson({
        ok: true,
      });
    }

    console.error(
      "ARTICLE VIEW INSERT ERROR:",
      error,
    );

    return analyticsJson(
      {
        error:
          "Unable to record article view.",
      },
      500,
    );
  }

  return analyticsJson({
    ok: true,
  });
}
