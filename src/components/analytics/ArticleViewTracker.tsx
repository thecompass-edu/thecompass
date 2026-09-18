"use client";

import { useEffect } from "react";

type ArticleViewTrackerProps = {
  articleId: string;
};

const VISITOR_STORAGE_KEY = "compass_visitor_id";
const SESSION_STORAGE_KEY = "compass_session_id";

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    localStorage.setItem(
      VISITOR_STORAGE_KEY,
      visitorId,
    );
  }

  return visitorId;
}

function getSessionId() {
  let sessionId = sessionStorage.getItem(
    SESSION_STORAGE_KEY,
  );

  if (!sessionId) {
    sessionId = crypto.randomUUID();

    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      sessionId,
    );
  }

  return sessionId;
}

export default function ArticleViewTracker({
  articleId,
}: ArticleViewTrackerProps) {
  useEffect(() => {
    const articleRecordedKey =
      `compass_article_view_${articleId}`;

    const alreadyRecorded =
      sessionStorage.getItem(articleRecordedKey);

    if (alreadyRecorded) {
      return;
    }

    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    async function recordArticleView() {
      try {
        const response = await fetch(
          "/api/analytics/article-view",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              articleId,
              visitorId,
              sessionId,
            }),
          },
        );

        if (response.ok) {
          sessionStorage.setItem(
            articleRecordedKey,
            "true",
          );
        }
      } catch (error) {
        console.error(
          "ARTICLE VIEW TRACKING ERROR:",
          error,
        );
      }
    }

    void recordArticleView();
  }, [articleId]);

  return null;
}