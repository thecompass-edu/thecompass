"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_STORAGE_KEY = "compass_visitor_id";
const SESSION_STORAGE_KEY = "compass_session_id";
const VISIT_RECORDED_KEY = "compass_visit_recorded";

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

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    /*
     * Do not count admin/login activity
     * as public website traffic.
     */
    const isAdminRoute =
      pathname.startsWith("/admin");

    const isLoginRoute =
      pathname.startsWith("/login");

    if (isAdminRoute || isLoginRoute) {
      return;
    }

    const alreadyRecorded =
      sessionStorage.getItem(
        VISIT_RECORDED_KEY,
      );

    if (alreadyRecorded) {
      return;
    }

    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    async function recordVisit() {
      try {
        const response = await fetch(
          "/api/analytics/visit",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              visitorId,
              sessionId,
            }),
          },
        );

        if (response.ok) {
          sessionStorage.setItem(
            VISIT_RECORDED_KEY,
            "true",
          );
        }
      } catch (error) {
        console.error(
          "VISIT TRACKING ERROR:",
          error,
        );
      }
    }

    void recordVisit();
  }, [pathname]);

  return null;
}