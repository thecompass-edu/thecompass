import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type ArticleViewRequestBody = {
  articleId?: string;
  visitorId?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArticleViewRequestBody;

    const articleId = body.articleId;
    const visitorId = body.visitorId;
    const sessionId = body.sessionId;

    if (!articleId || !visitorId || !sessionId) {
      return NextResponse.json(
        {
          error: "Missing article, visitor, or session ID.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    /*
     * Make sure the article exists and is published.
     */
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id, status")
      .eq("id", articleId)
      .eq("status", "published")
      .maybeSingle();

    if (articleError) {
      console.error("ARTICLE VIEW ARTICLE CHECK ERROR:", articleError);

      return NextResponse.json(
        {
          error: "Unable to verify article.",
        },
        {
          status: 500,
        },
      );
    }

    if (!article) {
      return NextResponse.json(
        {
          error: "Published article not found.",
        },
        {
          status: 404,
        },
      );
    }

    const { error } = await supabase.from("article_views").insert({
      article_id: articleId,
      visitor_id: visitorId,
      session_id: sessionId,
    });

    /*
     * 23505 means this article was already viewed
     * during this browsing session.
     *
     * We intentionally do not count it again.
     */
    if (error && error.code !== "23505") {
      console.error("ARTICLE VIEW TRACKING ERROR:", error);

      return NextResponse.json(
        {
          error: "Unable to record article view.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("ARTICLE VIEW API ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to record article view.",
      },
      {
        status: 500,
      },
    );
  }
}