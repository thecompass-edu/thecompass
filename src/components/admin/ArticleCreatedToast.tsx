"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useState } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const STORAGE_KEY = "compass-article-created";
const TOAST_DURATION = 4000;

type ArticleStatus = "draft" | "published";

type ArticleNotification = {
  title: string;
  status: ArticleStatus;
  timestamp: number;
};

export default function ArticleCreatedToast() {
  const [notification, setNotification] =
    useState<ArticleNotification | null>(null);

  useEffect(() => {
    function showNotification() {
      const storedNotification =
        sessionStorage.getItem(STORAGE_KEY);

      if (!storedNotification) {
        return;
      }

      try {
        const parsedNotification = JSON.parse(
          storedNotification,
        ) as ArticleNotification;

        const isRecent =
          Date.now() - parsedNotification.timestamp <
          10000;

        if (!isRecent) {
          sessionStorage.removeItem(STORAGE_KEY);
          return;
        }

        setNotification(parsedNotification);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    showNotification();

    window.addEventListener(
      "article-created",
      showNotification,
    );

    return () => {
      window.removeEventListener(
        "article-created",
        showNotification,
      );
    };
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNotification(null);
      sessionStorage.removeItem(STORAGE_KEY);
    }, TOAST_DURATION);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [notification]);

  function dismissToast() {
    setNotification(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  if (!notification) {
    return null;
  }

  const isPublished =
    notification.status === "published";

  const heading = isPublished
    ? "Article published"
    : "Draft saved";

  const message = isPublished
    ? "was published successfully."
    : "was saved as a draft.";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        ${jakarta.className}
        fixed bottom-5 right-5 z-11000
        w-[calc(100%-2.5rem)]
        max-w-105
        overflow-hidden
        border border-[#687704]/10
        border-l-4 border-l-[#687704]
        bg-[#F2F7ED]
        shadow-[0_12px_32px_rgba(39,67,13,0.16)]
        sm:bottom-6 sm:right-6
      `}
    >
      <div className="flex items-start gap-4 px-5 py-5">
        {/* Success indicator */}
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#687704] text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M7.5 12.5L10.5 15.5L16.5 8.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#27430D]">
            {heading}
          </p>

          <p className="mt-1 text-sm leading-5 text-[#523A23]/70">
            <span className="font-semibold text-[#523A23]">
              “{notification.title}”
            </span>{" "}
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="
            -mr-1 -mt-1
            flex h-8 w-8 shrink-0
            items-center justify-center
            rounded-lg
            text-xl
            font-medium
            leading-none
            text-[#27430D]/60
            transition
            hover:bg-[#687704]/10
            hover:text-[#27430D]
          "
        >
          ×
        </button>
      </div>
    </div>
  );
}