"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const ARTICLE_CREATED_STORAGE_KEY =
  "compass-article-created";

const ARTICLE_DELETED_STORAGE_KEY =
  "compass-article-deleted";

const TOAST_DURATION = 4500;
const MAX_NOTIFICATION_AGE = 60_000;

type ToastType =
  | "success"
  | "error";

type ToastState = {
  id: number;
  type: ToastType;
  title: string;
  message: string;
};

type ToastPayload = Omit<
  ToastState,
  "id"
>;

type ArticleCreatedNotification = {
  title: string;
  status:
    | "draft"
    | "published";
  timestamp: number;
};

type ArticleDeletedNotification = {
  title: string;
  timestamp: number;
};

type AdminToastEventDetail = {
  type?: ToastType;
  title: string;
  message: string;
};

/*
 * These functions only READ data and return
 * a toast payload.
 *
 * They do not update React state.
 */

function consumeCreatedNotification():
  ToastPayload | null {
  const stored =
    sessionStorage.getItem(
      ARTICLE_CREATED_STORAGE_KEY,
    );

  if (!stored) {
    return null;
  }

  /*
   * Consume immediately so the same
   * notification cannot appear twice.
   */
  sessionStorage.removeItem(
    ARTICLE_CREATED_STORAGE_KEY,
  );

  try {
    const notification =
      JSON.parse(
        stored,
      ) as ArticleCreatedNotification;

    const isRecent =
      Date.now() -
        notification.timestamp <
      MAX_NOTIFICATION_AGE;

    if (!isRecent) {
      return null;
    }

    if (
      notification.status ===
      "published"
    ) {
      return {
        type: "success",
        title:
          "Article published",
        message: `“${notification.title}” was published successfully.`,
      };
    }

    return {
      type: "success",
      title: "Draft saved",
      message: `“${notification.title}” was saved as a draft.`,
    };
  } catch {
    return null;
  }
}

function consumeDeletedNotification():
  ToastPayload | null {
  const stored =
    sessionStorage.getItem(
      ARTICLE_DELETED_STORAGE_KEY,
    );

  if (!stored) {
    return null;
  }

  sessionStorage.removeItem(
    ARTICLE_DELETED_STORAGE_KEY,
  );

  try {
    const notification =
      JSON.parse(
        stored,
      ) as ArticleDeletedNotification;

    const isRecent =
      Date.now() -
        notification.timestamp <
      MAX_NOTIFICATION_AGE;

    if (!isRecent) {
      return null;
    }

    return {
      type: "success",
      title:
        "Article deleted",
      message: `“${notification.title}” was deleted successfully.`,
    };
  } catch {
    return null;
  }
}

function SuccessIcon() {
  return (
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
  );
}

function ErrorIcon() {
  return (
    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M12 7.5V12.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle
          cx="12"
          cy="16.5"
          r="1"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AdminToastHost() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    toast,
    setToast,
  ] =
    useState<ToastState | null>(
      null,
    );

  /*
   * One function is responsible for
   * displaying every toast.
   */
  const showToast =
    useCallback(
      (
        payload:
          ToastPayload,
      ) => {
        setToast({
          id: Date.now(),
          ...payload,
        });
      },
      [],
    );

  /*
   * Server actions may redirect back
   * with:
   *
   * ?error=...
   * &attempt=draft
   *
   * or
   *
   * &attempt=published
   */
  useEffect(() => {
    const error =
      searchParams.get(
        "error",
      );

    if (!error) {
      return;
    }

    const attempt =
      searchParams.get(
        "attempt",
      );

    /*
     * Never allow a stale success toast
     * after the action failed.
     */
    sessionStorage.removeItem(
      ARTICLE_CREATED_STORAGE_KEY,
    );

    let title =
      "Something went wrong";

    if (
      attempt === "published"
    ) {
      title =
        "Article was not published";
    }

    if (
      attempt === "draft"
    ) {
      title =
        "Draft was not saved";
    }

    const payload:
      ToastPayload = {
      type: "error",
      title,
      message: error,
    };

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.delete("error");
    params.delete("attempt");

    const query =
      params.toString();

    /*
     * Schedule the state update after
     * this effect finishes.
     *
     * This avoids synchronous setState
     * inside the effect itself.
     */
    const timeout =
      window.setTimeout(
        () => {
          showToast(
            payload,
          );

          router.replace(
            query
              ? `${pathname}?${query}`
              : pathname,
            {
              scroll: false,
            },
          );
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    pathname,
    router,
    searchParams,
    showToast,
  ]);

  /*
   * Check pending notifications after
   * navigating between admin routes.
   *
   * This handles:
   *
   * Save Draft
   * Publish
   * Create article
   */
  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          const createdToast =
            consumeCreatedNotification();

          if (
            createdToast
          ) {
            showToast(
              createdToast,
            );

            return;
          }

          const deletedToast =
            consumeDeletedNotification();

          if (
            deletedToast
          ) {
            showToast(
              deletedToast,
            );
          }
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    pathname,
    showToast,
  ]);

  /*
   * Some actions happen without a route
   * change.
   *
   * Delete currently works this way,
   * so ArticleActionsMenu dispatches
   * "article-deleted".
   *
   * "admin-toast" is the reusable event
   * that future admin actions can use.
   */
  useEffect(() => {
    function handleArticleCreated() {
      const nextToast =
        consumeCreatedNotification();

      if (!nextToast) {
        return;
      }

      showToast(
        nextToast,
      );
    }

    function handleArticleDeleted() {
      const nextToast =
        consumeDeletedNotification();

      if (!nextToast) {
        return;
      }

      showToast(
        nextToast,
      );
    }

    function handleGenericToast(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<AdminToastEventDetail>;

      const detail =
        customEvent.detail;

      if (
        !detail?.title ||
        !detail?.message
      ) {
        return;
      }

      showToast({
        type:
          detail.type ??
          "success",
        title:
          detail.title,
        message:
          detail.message,
      });
    }

    window.addEventListener(
      "article-created",
      handleArticleCreated,
    );

    window.addEventListener(
      "article-deleted",
      handleArticleDeleted,
    );

    window.addEventListener(
      "admin-toast",
      handleGenericToast,
    );

    return () => {
      window.removeEventListener(
        "article-created",
        handleArticleCreated,
      );

      window.removeEventListener(
        "article-deleted",
        handleArticleDeleted,
      );

      window.removeEventListener(
        "admin-toast",
        handleGenericToast,
      );
    };
  }, [showToast]);

  /*
   * Automatically dismiss the active
   * notification after a few seconds.
   */
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setToast(null);
        },
        TOAST_DURATION,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [toast]);

  if (!toast) {
    return null;
  }

  const isError =
    toast.type === "error";

  return (
    <div
      key={toast.id}
      role={
        isError
          ? "alert"
          : "status"
      }
      aria-live={
        isError
          ? "assertive"
          : "polite"
      }
      className={`
        fixed bottom-5 right-5 z-11000
        w-[calc(100%-2.5rem)]
        max-w-105
        overflow-hidden
        border
        shadow-[0_12px_32px_rgba(39,67,13,0.16)]
        sm:bottom-6
        sm:right-6
        ${
          isError
            ? "border-red-200 border-l-4 border-l-red-600 bg-red-50"
            : "border-[#687704]/10 border-l-4 border-l-[#687704] bg-[#F2F7ED]"
        }
      `}
    >
      <div className="flex items-start gap-4 px-5 py-5">
        {isError ? (
          <ErrorIcon />
        ) : (
          <SuccessIcon />
        )}

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-bold ${
              isError
                ? "text-red-800"
                : "text-[#27430D]"
            }`}
          >
            {toast.title}
          </p>

          <p
            className={`mt-1 text-sm leading-5 ${
              isError
                ? "text-red-700/80"
                : "text-[#523A23]/70"
            }`}
          >
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setToast(null)
          }
          aria-label="Dismiss notification"
          className={`
            -mr-1 -mt-1
            flex h-8 w-8 shrink-0
            items-center justify-center
            rounded-lg
            transition
            ${
              isError
                ? "text-red-700/60 hover:bg-red-100 hover:text-red-800"
                : "text-[#27430D]/60 hover:bg-[#687704]/10 hover:text-[#27430D]"
            }
          `}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}