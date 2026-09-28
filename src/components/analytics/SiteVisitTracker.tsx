"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "compass_visitor_id";
const SESSION_ID_KEY = "compass_session_id";
const VISIT_RECORDED_KEY = "compass_visit_recorded";

function getOrCreateId(
  storage: Storage,
  key: string,
) {
  const existing = storage.getItem(key);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();

  storage.setItem(key, id);

  return id;
}

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Ignore admin and login traffic.
      if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/login")
      ) {
        return;
      }

      if (
        sessionStorage.getItem(
          VISIT_RECORDED_KEY,
        ) === "1"
      ) {
        return;
      }

      const visitorId = getOrCreateId(
        localStorage,
        VISITOR_ID_KEY,
      );

      const sessionId = getOrCreateId(
        sessionStorage,
        SESSION_ID_KEY,
      );

      void fetch("/api/analytics/visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId,
          sessionId,
        }),
        cache: "no-store",
        keepalive: true,
      })
        .then((response) => {
          if (response.ok) {
            sessionStorage.setItem(
              VISIT_RECORDED_KEY,
              "1",
            );
          }
        })
        .catch(() => {
          // Analytics should never interrupt the website.
        });
    } catch {
      // Storage may be unavailable in some browsers.
    }
  }, [pathname]);

  return null;
}