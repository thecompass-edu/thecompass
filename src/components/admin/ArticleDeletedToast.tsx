"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useState } from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const STORAGE_KEY = "compass-article-deleted";
const TOAST_DURATION = 4000;

type DeleteNotification = {
  title: string;
  timestamp: number;
};

export default function ArticleDeletedToast() {
  const [articleTitle, setArticleTitle] =
    useState<string | null>(null);

  useEffect(() => {
    function showNotification() {
      const storedNotification =
        sessionStorage.getItem(STORAGE_KEY);

      if (!storedNotification) {
        return;
      }

      try {
        const notification = JSON.parse(
          storedNotification,
        ) as DeleteNotification;

        const isRecent =
          Date.now() - notification.timestamp <
          10000;

        if (!isRecent) {
          sessionStorage.removeItem(
            STORAGE_KEY,
          );

          return;
        }

        setArticleTitle(
          notification.title,
        );
      } catch {
        sessionStorage.removeItem(
          STORAGE_KEY,
        );
      }
    }

    showNotification();

    window.addEventListener(
      "article-deleted",
      showNotification,
    );

    return () => {
      window.removeEventListener(
        "article-deleted",
        showNotification,
      );
    };
  }, []);

  useEffect(() => {
    if (!articleTitle) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setArticleTitle(null);

        sessionStorage.removeItem(
          STORAGE_KEY,
        );
      },
      TOAST_DURATION,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [articleTitle]);

  function dismissToast() {
    setArticleTitle(null);

    sessionStorage.removeItem(
      STORAGE_KEY,
    );
  }

  if (!articleTitle) {
    return null;
  }

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
            Article deleted
          </p>

          <p className="mt-1 text-sm leading-5 text-[#523A23]/70">
            <span className="font-semibold text-[#523A23]">
              “{articleTitle}”
            </span>{" "}
            was deleted successfully.
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