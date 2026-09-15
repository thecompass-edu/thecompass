"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const ARTICLE_TOAST_STORAGE_KEY =
  "compass-article-created";

const ARTICLE_TOAST_MAX_AGE =
  60 * 1000;

type ToastType =
  | "success"
  | "error";

type ToastState = {
  type: ToastType;
  title: string;
  message: string;
};

type PendingArticleToast = {
  title: string;
  status: "draft" | "published";
  timestamp: number;
};

function SuccessIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 12.5L10.2 15.5L17 8.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 7.5V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M12 16.5H12.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
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

export default function ArticlesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [toast, setToast] =
    useState<ToastState | null>(
      null,
    );

  /*
   * Show server errors as a bottom-right toast.
   */
  useEffect(() => {
    const errorMessage =
      searchParams.get("error");

    if (!errorMessage) {
      return;
    }

    const attempt =
      searchParams.get("attempt");

    sessionStorage.removeItem(
      ARTICLE_TOAST_STORAGE_KEY,
    );

    const nextToast: ToastState = {
      type: "error",
      title:
        attempt === "published"
          ? "Failed to publish article."
          : "Failed to save draft.",
      message: errorMessage,
    };

    const timeout =
      window.setTimeout(() => {
        setToast(nextToast);

        /*
         * Remove the error parameters after
         * displaying the notification.
         */
        const nextParams =
          new URLSearchParams(
            searchParams.toString(),
          );

        nextParams.delete("error");
        nextParams.delete("attempt");

        const query =
          nextParams.toString();

        router.replace(
          query
            ? `${pathname}?${query}`
            : pathname,
          {
            scroll: false,
          },
        );
      }, 0);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    pathname,
    router,
    searchParams,
  ]);

  /*
   * When the server successfully creates
   * the article, it redirects back to
   * /admin/articles.
   *
   * Read the pending result that the
   * editor stored before submitting.
   */
  useEffect(() => {
    if (
      pathname !== "/admin/articles"
    ) {
      return;
    }

    const storedToast =
      sessionStorage.getItem(
        ARTICLE_TOAST_STORAGE_KEY,
      );

    if (!storedToast) {
      return;
    }

    /*
     * Remove it immediately so refreshing
     * doesn't show the notification again.
     */
    sessionStorage.removeItem(
      ARTICLE_TOAST_STORAGE_KEY,
    );

    let nextToast: ToastState | null =
      null;

    try {
      const parsed =
        JSON.parse(
          storedToast,
        ) as PendingArticleToast;

      const isExpired =
        !parsed.timestamp ||
        Date.now() -
          parsed.timestamp >
          ARTICLE_TOAST_MAX_AGE;

      if (isExpired) {
        return;
      }

      if (
        parsed.status === "draft"
      ) {
        nextToast = {
          type: "success",
          title: "Draft saved",
          message: `"${parsed.title}" was saved as a draft.`,
        };
      }

      if (
        parsed.status === "published"
      ) {
        nextToast = {
          type: "success",
          title:
            "Article published",
          message: `"${parsed.title}" was published successfully.`,
        };
      }
    } catch {
      return;
    }

    if (!nextToast) {
      return;
    }

    const toastToShow =
      nextToast;

    const timeout =
      window.setTimeout(() => {
        setToast(toastToShow);
      }, 0);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [pathname]);

  /*
   * Automatically hide the toast
   * after five seconds.
   */
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        setToast(null);
      }, 5000);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [toast]);

  return (
    <>
      {children}

      {/* Bottom-right Toast */}
      {toast && (
        <div
          className="
            fixed bottom-5 left-4 right-4
            z-[200]
            sm:left-auto
            sm:right-6
            sm:w-[420px]
          "
        >
          <div
            role={
              toast.type === "error"
                ? "alert"
                : "status"
            }
            aria-live={
              toast.type === "error"
                ? "assertive"
                : "polite"
            }
            className={`
              relative
              border
              border-l-4
              px-6 py-5
              shadow-[0_18px_45px_rgba(39,67,13,0.10)]
              ${
                toast.type ===
                "success"
                  ? "border-[#DCE5CF] border-l-[#7B9100] bg-[#F3F7EE]"
                  : "border-red-200 border-l-red-500 bg-red-50"
              }
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`
                  mt-0.5 flex h-8 w-8
                  shrink-0 items-center
                  justify-center rounded-full
                  text-white
                  ${
                    toast.type ===
                    "success"
                      ? "bg-[#7B9100]"
                      : "bg-red-500"
                  }
                `}
              >
                {toast.type ===
                "success" ? (
                  <SuccessIcon />
                ) : (
                  <ErrorIcon />
                )}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p
                  className={`
                    text-base font-semibold
                    ${
                      toast.type ===
                      "success"
                        ? "text-[#27430D]"
                        : "text-red-700"
                    }
                  `}
                >
                  {toast.title}
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-[#523A23]/65">
                  {toast.message}
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() =>
                  setToast(null)
                }
                aria-label="Dismiss notification"
                className={`
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  transition
                  ${
                    toast.type ===
                    "success"
                      ? "text-[#687704]/65 hover:text-[#27430D]"
                      : "text-red-400 hover:text-red-700"
                  }
                `}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}