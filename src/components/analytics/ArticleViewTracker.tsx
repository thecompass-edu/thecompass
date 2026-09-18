"use client";

import {
  useEffect,
} from "react";

const VISITOR_ID_KEY =
  "compass_visitor_id";

const SESSION_ID_KEY =
  "compass_session_id";

type ArticleViewTrackerProps = {
  articleId: string;
};

function getOrCreateId(
  storage: Storage,
  key: string,
) {
  const existing =
    storage.getItem(key);

  if (existing) {
    return existing;
  }

  const id =
    crypto.randomUUID();

  storage.setItem(
    key,
    id,
  );

  return id;
}

export default function ArticleViewTracker({
  articleId,
}: ArticleViewTrackerProps) {
  useEffect(() => {
    try {
      const viewKey =
        `compass_article_view_${articleId}`;

      if (
        sessionStorage.getItem(
          viewKey,
        ) === "1"
      ) {
        return;
      }

      const visitorId =
        getOrCreateId(
          localStorage,
          VISITOR_ID_KEY,
        );

      const sessionId =
        getOrCreateId(
          sessionStorage,
          SESSION_ID_KEY,
        );

      const controller =
        new AbortController();

      void fetch(
        "/api/analytics/article-view",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            articleId,
            visitorId,
            sessionId,
          }),
          cache: "no-store",
          keepalive: true,
          signal:
            controller.signal,
        },
      )
        .then((response) => {
          if (response.ok) {
            sessionStorage.setItem(
              viewKey,
              "1",
            );
          }
        })
        .catch(() => {
          // Analytics should never interrupt the article.
        });

      return () => {
        controller.abort();
      };
    } catch {
      // Storage may be unavailable in some browsers.
    }
  }, [articleId]);

  return null;
}