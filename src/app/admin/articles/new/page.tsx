"use client";

import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import ActionButton from "@/components/admin/ActionButton";
import ArticleEditor from "@/components/admin/ArticleEditor";
import AuthorsInput from "@/components/admin/AuthorsInput";
import CoverImageUpload from "@/components/admin/CoverImageUpload";

import { createArticle } from "./actions";

const ARTICLE_TOAST_STORAGE_KEY =
  "compass-article-created";

type ValidationField =
  | "title"
  | "excerpt"
  | "cover_image"
  | "authors"
  | "category"
  | "content";

type ArticleAction =
  | "draft"
  | "published";

function RequiredMark() {
  return (
    <span
      aria-hidden="true"
      className="text-red-500"
    >
      *
    </span>
  );
}

function RequiredError() {
  return (
    <p className="mt-2 text-xs font-medium text-red-600">
      This field is required.
    </p>
  );
}

function DetailsCollapseIcon({
  size = 22,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 5H17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M6.5 15L12 9.5L17.5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function hasMeaningfulContent(
  html: string,
) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0;
}

function getMissingRequiredFields(
  form: HTMLFormElement,
): ValidationField[] {
  const formData =
    new FormData(form);

  const missingFields: ValidationField[] =
    [];

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") ?? "",
  ).trim();

  const category = String(
    formData.get("category") ?? "",
  ).trim();

  const content = String(
    formData.get("content") ?? "",
  ).trim();

  const authors = formData
    .getAll("authors")
    .map((author) =>
      String(author).trim(),
    )
    .filter(Boolean);

  const coverImage =
    formData.get("cover_image");

  if (!title) {
    missingFields.push("title");
  }

  if (!excerpt) {
    missingFields.push("excerpt");
  }

  if (
    !(coverImage instanceof File) ||
    coverImage.size === 0
  ) {
    missingFields.push(
      "cover_image",
    );
  }

  if (authors.length === 0) {
    missingFields.push("authors");
  }

  if (!category) {
    missingFields.push("category");
  }

  if (
    !hasMeaningfulContent(content)
  ) {
    missingFields.push("content");
  }

  return missingFields;
}

function hasFormChanges(
  form: HTMLFormElement,
) {
  const formData =
    new FormData(form);

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") ?? "",
  ).trim();

  const category = String(
    formData.get("category") ?? "",
  ).trim();

  const content = String(
    formData.get("content") ?? "",
  ).trim();

  const authors = formData
    .getAll("authors")
    .map((author) =>
      String(author).trim(),
    )
    .filter(Boolean);

  const coverImage =
    formData.get("cover_image");

  const authorInput =
    form.querySelector<HTMLInputElement>(
      '[data-validation-field="authors"] input',
    );

  return Boolean(
    title ||
      excerpt ||
      category ||
      hasMeaningfulContent(
        content,
      ) ||
      authors.length > 0 ||
      authorInput?.value.trim() ||
      (coverImage instanceof File &&
        coverImage.size > 0),
  );
}

export default function NewArticlePage() {
  const router = useRouter();

  const formRef =
    useRef<HTMLFormElement>(null);

  const detailsToggleRef =
    useRef<HTMLInputElement>(null);

  /*
   * These are the REAL submit buttons.
   *
   * They are hidden from the UI and do not
   * contain confirmation click handlers.
   *
   * This prevents requestSubmit() from
   * reopening the confirmation modal.
   */
  const draftSubmitRef =
    useRef<HTMLButtonElement>(null);

  const publishSubmitRef =
    useRef<HTMLButtonElement>(null);

  const isSubmittingRef =
    useRef(false);

  const [title, setTitle] =
    useState("");

  const [
    invalidFields,
    setInvalidFields,
  ] = useState<
    Set<ValidationField>
  >(new Set());

  const [
    confirmationAction,
    setConfirmationAction,
  ] =
    useState<ArticleAction | null>(
      null,
    );

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<ArticleAction | null>(
      null,
    );

  const [
    exitConfirmationOpen,
    setExitConfirmationOpen,
  ] = useState(false);

  const [
    hasUnsavedChanges,
    setHasUnsavedChanges,
  ] = useState(false);

  /*
   * Close open modal with Escape.
   */
  useEffect(() => {
    const modalOpen =
      Boolean(
        confirmationAction,
      ) ||
      exitConfirmationOpen;

    if (!modalOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      if (pendingAction) {
        return;
      }

      setConfirmationAction(
        null,
      );

      setExitConfirmationOpen(
        false,
      );
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    confirmationAction,
    exitConfirmationOpen,
    pendingAction,
  ]);

  /*
   * Prevent page scrolling while
   * a modal is open.
   */
  useEffect(() => {
    const modalOpen =
      Boolean(
        confirmationAction,
      ) ||
      exitConfirmationOpen;

    if (!modalOpen) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    confirmationAction,
    exitConfirmationOpen,
  ]);

  function showValidationErrors(
    form: HTMLFormElement,
    missingFields:
      ValidationField[],
  ) {
    setInvalidFields(
      new Set(missingFields),
    );

    sessionStorage.removeItem(
      ARTICLE_TOAST_STORAGE_KEY,
    );

    const hasMissingArticleDetails =
      missingFields.some(
        (field) =>
          field !== "content",
      );

    if (
      hasMissingArticleDetails &&
      detailsToggleRef.current
    ) {
      detailsToggleRef.current.checked =
        true;
    }

    requestAnimationFrame(() => {
      const firstMissingField =
        missingFields[0];

      if (!firstMissingField) {
        return;
      }

      const element =
        form.querySelector<HTMLElement>(
          `[data-validation-field="${firstMissingField}"]`,
        );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  /*
   * Track unsaved changes and remove
   * validation errors as fields are fixed.
   */
  function handleFormInput(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    const form =
      event.currentTarget;

    setHasUnsavedChanges(
      hasFormChanges(form),
    );

    if (
      invalidFields.size === 0
    ) {
      return;
    }

    const missingFields =
      getMissingRequiredFields(
        form,
      );

    setInvalidFields(
      new Set(
        missingFields,
      ),
    );
  }

  /*
   * Back to Articles.
   *
   * If the form contains unsaved changes,
   * show the unsaved-changes modal.
   */
  function handleBackClick(
    event:
      MouseEvent<HTMLAnchorElement>,
  ) {
    if (
      !hasUnsavedChanges ||
      isSubmittingRef.current
    ) {
      return;
    }

    event.preventDefault();

    setConfirmationAction(
      null,
    );

    setExitConfirmationOpen(
      true,
    );
  }

  /*
   * Visible Save Draft / Publish buttons
   * call this.
   *
   * These buttons are type="button",
   * so they cannot submit the form directly.
   */
  function handleActionClick(
    action: ArticleAction,
  ) {
    if (pendingAction) {
      return;
    }

    const form =
      formRef.current;

    if (!form) {
      return;
    }

    const missingFields =
      getMissingRequiredFields(
        form,
      );

    if (
      missingFields.length > 0
    ) {
      showValidationErrors(
        form,
        missingFields,
      );

      return;
    }

    setInvalidFields(
      new Set(),
    );

    setExitConfirmationOpen(
      false,
    );

    setConfirmationAction(
      action,
    );
  }

  /*
   * Called after confirming the normal
   * Save Draft or Publish modal.
   *
   * IMPORTANT:
   * This submits using the hidden button,
   * not the visible confirmation button.
   */
  function handleConfirmAction() {
    const form =
      formRef.current;

    if (
      !form ||
      !confirmationAction ||
      pendingAction
    ) {
      return;
    }

    const action =
      confirmationAction;

    if (
      action === "published"
    ) {
      if (
        !publishSubmitRef.current
      ) {
        return;
      }

      setPendingAction(
        "published",
      );

      form.requestSubmit(
        publishSubmitRef.current,
      );

      return;
    }

    if (
      !draftSubmitRef.current
    ) {
      return;
    }

    setPendingAction(
      "draft",
    );

    form.requestSubmit(
      draftSubmitRef.current,
    );
  }

  /*
   * The Unsaved Changes modal is already
   * a confirmation.
   *
   * Therefore Save Draft here submits
   * immediately and DOES NOT open the
   * normal "Save as draft?" modal.
   */
  function handleSaveBeforeExit() {
    const form =
      formRef.current;

    if (
      !form ||
      pendingAction
    ) {
      return;
    }

    const missingFields =
      getMissingRequiredFields(
        form,
      );

    if (
      missingFields.length > 0
    ) {
      setExitConfirmationOpen(
        false,
      );

      showValidationErrors(
        form,
        missingFields,
      );

      return;
    }

    if (
      !draftSubmitRef.current
    ) {
      return;
    }

    setPendingAction(
      "draft",
    );

    form.requestSubmit(
      draftSubmitRef.current,
    );
  }

  /*
   * Leave the editor without
   * saving anything.
   */
  function handleExitWithoutSaving() {
    isSubmittingRef.current =
      true;

    setHasUnsavedChanges(
      false,
    );

    setExitConfirmationOpen(
      false,
    );

    sessionStorage.removeItem(
      ARTICLE_TOAST_STORAGE_KEY,
    );

    router.push(
      "/admin/articles",
    );
  }

  /*
   * This fires only when the real hidden
   * submit button submits the form.
   *
   * Store success-toast information while
   * the server performs the actual save.
   */
  function handleSubmitCapture(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    const nativeEvent =
      event.nativeEvent as SubmitEvent;

    const submitter =
      nativeEvent.submitter;

    if (
      !(
        submitter instanceof
        HTMLButtonElement
      )
    ) {
      return;
    }

    const status =
      submitter.value ===
      "published"
        ? "published"
        : "draft";

    isSubmittingRef.current =
      true;

    setHasUnsavedChanges(
      false,
    );

    sessionStorage.setItem(
      ARTICLE_TOAST_STORAGE_KEY,
      JSON.stringify({
        title:
          title.trim() ||
          "Untitled article",
        status,
        timestamp: Date.now(),
      }),
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#27430D]">
      <form
        ref={formRef}
        action={createArticle}
        onInput={
          handleFormInput
        }
        onChange={
          handleFormInput
        }
        onSubmitCapture={
          handleSubmitCapture
        }
      >
        {/*
         * REAL hidden form submit buttons.
         *
         * Visible Save Draft / Publish controls
         * never submit directly.
         */}
        <button
          ref={draftSubmitRef}
          type="submit"
          name="status"
          value="draft"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />

        <button
          ref={publishSubmitRef}
          type="submit"
          name="status"
          value="published"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />

        {/* Main Header */}
        <header className="sticky top-0 z-50 border-b border-[#27430D]/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-19 flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/articles"
              onClick={
                handleBackClick
              }
              className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#523A23]/65 transition hover:text-[#27430D]"
            >
              <span>←</span>

              <span>
                Articles
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#27430D]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#523A23]/65">
                <span className="h-1.5 w-1.5 rounded-full bg-[#687704]" />

                Draft
              </div>

              <span className="hidden text-sm text-[#523A23]/35 sm:inline">
                {hasUnsavedChanges
                  ? "Unsaved changes"
                  : "Not saved yet"}
              </span>

              {/*
               * UI BUTTON ONLY.
               * Does not submit directly.
               */}
              <button
                type="button"
                onClick={() =>
                  handleActionClick(
                    "draft",
                  )
                }
                disabled={Boolean(
                  pendingAction,
                )}
                className="rounded-xl border border-[#27430D]/20 bg-white px-5 py-3 text-sm font-semibold text-[#27430D] transition hover:border-[#687704]/50 hover:bg-[#687704]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Draft
              </button>

              {/*
               * UI BUTTON ONLY.
               * Does not submit directly.
               */}
              <button
                type="button"
                onClick={() =>
                  handleActionClick(
                    "published",
                  )
                }
                disabled={Boolean(
                  pendingAction,
                )}
                className="rounded-xl bg-[#27430D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#687704] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* Validation Error */}
        {invalidFields.size >
          0 && (
          <div
            role="alert"
            aria-live="polite"
            className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700"
          >
            Please complete all
            highlighted fields
            before continuing.
          </div>
        )}

        {/* Article Details Toggle */}
        <input
          ref={
            detailsToggleRef
          }
          id="article-details-toggle"
          type="checkbox"
          defaultChecked
          className="peer sr-only"
        />

        {/* Article Details Header */}
        <label
          htmlFor="article-details-toggle"
          className="
            sticky top-19 z-40
            flex min-h-14 cursor-pointer
            items-center justify-between gap-4
            border-b border-[#27430D]/10
            bg-white/95 px-5
            backdrop-blur
            peer-checked:[&_.details-collapse-icon]:rotate-0
          "
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold text-[#27430D] sm:text-base">
              Article details
            </h2>

            <p className="text-xs text-[#523A23]/40 sm:text-sm">
              title · excerpt ·
              authors · category ·
              cover image
            </p>
          </div>

          <span
            title="Show or hide article details"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-[#687704]
              transition-colors duration-200
              hover:bg-[#F6F1EA]
              hover:text-[#27430D]
            "
          >
            <span
              className="
                details-collapse-icon
                flex rotate-180
                items-center justify-center
                transition-transform
                duration-300
                ease-in-out
              "
            >
              <DetailsCollapseIcon
                size={22}
              />
            </span>
          </span>
        </label>

        {/* Article Details */}
        <section className="hidden border-b border-[#27430D]/10 bg-white peer-checked:block">
          <div className="px-5 py-6">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              {/* Title + Excerpt */}
              <div className="space-y-6">
                {/* Title */}
                <div data-validation-field="title">
                  <label
                    htmlFor="title"
                    className="text-sm font-semibold text-[#27430D]"
                  >
                    Title{" "}
                    <RequiredMark />
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(
                      event,
                    ) =>
                      setTitle(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Enter article title"
                    aria-invalid={
                      invalidFields.has(
                        "title",
                      )
                        ? true
                        : undefined
                    }
                    className={`mt-3 w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-[#27430D] outline-none transition placeholder:font-normal placeholder:text-[#523A23]/30 ${
                      invalidFields.has(
                        "title",
                      )
                        ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                        : "border-[#27430D]/15 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                    }`}
                  />

                  {invalidFields.has(
                    "title",
                  ) ? (
                    <RequiredError />
                  ) : (
                    <p className="mt-2 text-xs text-[#523A23]/35">
                      The article URL
                      will be generated
                      automatically from
                      this title.
                    </p>
                  )}
                </div>

                {/* Excerpt */}
                <div data-validation-field="excerpt">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="excerpt"
                      className="text-sm font-semibold text-[#27430D]"
                    >
                      Excerpt{" "}
                      <RequiredMark />
                    </label>

                    <span className="text-xs text-[#523A23]/35">
                      Maximum 160
                      characters
                    </span>
                  </div>

                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={6}
                    maxLength={160}
                    required
                    placeholder="One or two sentences summarising the article."
                    aria-invalid={
                      invalidFields.has(
                        "excerpt",
                      )
                        ? true
                        : undefined
                    }
                    className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-[#523A23] outline-none transition placeholder:text-[#523A23]/25 ${
                      invalidFields.has(
                        "excerpt",
                      )
                        ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                        : "border-[#27430D]/15 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                    }`}
                  />

                  {invalidFields.has(
                    "excerpt",
                  ) ? (
                    <RequiredError />
                  ) : (
                    <p className="mt-2 text-sm text-[#523A23]/40">
                      Shown on the
                      article list and
                      at the top of the
                      article.
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div data-validation-field="cover_image">
                <div
                  className={
                    invalidFields.has(
                      "cover_image",
                    )
                      ? "[&_.border-dashed]:!border-red-500"
                      : ""
                  }
                >
                  <CoverImageUpload
                    required
                  />
                </div>

                {invalidFields.has(
                  "cover_image",
                ) ? (
                  <RequiredError />
                ) : (
                  <p className="mt-2 text-sm text-[#523A23]/40">
                    Used on the
                    article list and
                    at the top of the
                    published article.
                  </p>
                )}
              </div>
            </div>

            {/* Article Information */}
            <div className="mt-8 rounded-xl border border-[#27430D]/10 bg-white p-5">
              <div>
                <h3 className="text-sm font-semibold text-[#27430D]">
                  Article information
                </h3>

                <p className="mt-1 text-sm text-[#523A23]/40">
                  Add everyone who
                  wrote the article
                  and choose its
                  category.
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Authors */}
                <div
                  data-validation-field="authors"
                  className="px-3"
                >
                  <div
                    className={
                      invalidFields.has(
                        "authors",
                      )
                        ? `
                          [&_input]:!border-red-500
                          [&_input]:!ring-4
                          [&_input]:!ring-red-500/10
                          [&_input:focus]:!border-red-500
                          [&_input:focus]:!ring-red-500/10
                        `
                        : ""
                    }
                  >
                    <AuthorsInput />
                  </div>

                  {invalidFields.has(
                    "authors",
                  ) && (
                    <RequiredError />
                  )}
                </div>

                {/* Category */}
                <div
                  data-validation-field="category"
                  className="border-t border-[#27430D]/10 px-3 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
                >
                  <label
                    htmlFor="category"
                    className="text-sm font-semibold text-[#27430D]"
                  >
                    Category{" "}
                    <RequiredMark />
                  </label>

                  <div className="mt-3">
                    <input
                      id="category"
                      name="category"
                      type="text"
                      required
                      placeholder="e.g. Financial Literacy"
                      aria-invalid={
                        invalidFields.has(
                          "category",
                        )
                          ? true
                          : undefined
                      }
                      className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 ${
                        invalidFields.has(
                          "category",
                        )
                          ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#27430D]/15 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                      }`}
                    />
                  </div>

                  {invalidFields.has(
                    "category",
                  ) ? (
                    <RequiredError />
                  ) : (
                    <p className="mt-2 text-xs text-[#523A23]/35">
                      Used to group
                      related articles
                      across The
                      Compass.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content Label */}
        <section className="bg-white px-5 pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-[#27430D]">
                Article content{" "}
                <RequiredMark />
              </label>

              <span
                className={`text-xs ${
                  invalidFields.has(
                    "content",
                  )
                    ? "font-medium text-red-600"
                    : "text-[#523A23]/35"
                }`}
              >
                {invalidFields.has(
                  "content",
                )
                  ? "Article content is required"
                  : "Required to save or publish"}
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="bg-white px-5 pb-8">
          <div
            data-validation-field="content"
            className="mx-auto max-w-6xl"
          >
            <div
              className={
                invalidFields.has(
                  "content",
                )
                  ? "rounded-xl ring-2 ring-red-500 ring-offset-2 ring-offset-white"
                  : ""
              }
            >
              <ArticleEditor
                stickyToolbarOffset={
                  132
                }
              />
            </div>

            {invalidFields.has(
              "content",
            ) && (
              <RequiredError />
            )}
          </div>
        </section>
      </form>

      {/* Save / Publish Confirmation Modal */}
      {confirmationAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/40 px-4 backdrop-blur-[2px]"
          onMouseDown={(
            event,
          ) => {
            if (
              !pendingAction &&
              event.target ===
              event.currentTarget
            ) {
              setConfirmationAction(
                null,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-description"
            aria-busy={Boolean(
              pendingAction,
            )}
            className="w-full max-w-md rounded-2xl border border-[#27430D]/10 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2
                  id="confirmation-modal-title"
                  className="text-xl font-semibold tracking-tight text-[#27430D]"
                >
                  {pendingAction ===
                  "published"
                    ? "Publishing article…"
                    : pendingAction ===
                        "draft"
                      ? "Saving draft…"
                      : confirmationAction ===
                          "published"
                        ? "Publish article?"
                        : "Save as draft?"}
                </h2>

                <p
                  id="confirmation-modal-description"
                  className="mt-2 text-sm leading-6 text-[#523A23]/60"
                >
                  {pendingAction ===
                  "published"
                    ? "Please wait while the article is being published."
                    : pendingAction ===
                        "draft"
                      ? "Please wait while your draft is being saved."
                      : confirmationAction ===
                          "published"
                        ? "This article will become available as published content."
                        : "This article will be saved as a draft and can be published later."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfirmationAction(
                    null,
                  )
                }
                disabled={Boolean(
                  pendingAction,
                )}
                aria-label="Close confirmation"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#523A23]/45 transition hover:bg-[#F6F1EA] hover:text-[#27430D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-[#27430D]/10 bg-[#F9F7F3] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#687704]">
                Article
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#27430D]">
                {title.trim() ||
                  "Untitled article"}
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton
                variant="secondary"
                disabled={Boolean(
                  pendingAction,
                )}
                onClick={() =>
                  setConfirmationAction(
                    null,
                  )
                }
              >
                Cancel
              </ActionButton>

              <ActionButton
                variant={
                  confirmationAction ===
                  "published"
                    ? "primary"
                    : "accent"
                }
                loading={Boolean(
                  pendingAction,
                )}
                loadingText={
                  confirmationAction ===
                  "published"
                    ? "Publishing…"
                    : "Saving…"
                }
                onClick={
                  handleConfirmAction
                }
                className="min-w-32"
              >
                {confirmationAction ===
                "published"
                  ? "Publish"
                  : "Save Draft"}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {exitConfirmationOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1A1A1A]/40 px-4 backdrop-blur-[2px]"
          onMouseDown={(
            event,
          ) => {
            if (
              !pendingAction &&
              event.target ===
              event.currentTarget
            ) {
              setExitConfirmationOpen(
                false,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
            aria-describedby="unsaved-changes-description"
            aria-busy={Boolean(
              pendingAction,
            )}
            className="w-full max-w-md rounded-2xl border border-[#27430D]/10 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2
                  id="unsaved-changes-title"
                  className="text-xl font-semibold tracking-tight text-[#27430D]"
                >
                  Unsaved changes
                </h2>

                <p
                  id="unsaved-changes-description"
                  className="mt-2 text-sm leading-6 text-[#523A23]/60"
                >
                  You have changes
                  that haven&apos;t
                  been saved. Would
                  you like to save
                  them as a draft
                  before leaving?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setExitConfirmationOpen(
                    false,
                  )
                }
                disabled={Boolean(
                  pendingAction,
                )}
                aria-label="Keep editing"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#523A23]/45 transition hover:bg-[#F6F1EA] hover:text-[#27430D] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-[#27430D]/10 bg-[#F9F7F3] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#687704]">
                Unsaved article
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#27430D]">
                {title.trim() ||
                  "Untitled article"}
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  handleExitWithoutSaving
                }
                disabled={Boolean(
                  pendingAction,
                )}
                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Exit without saving
              </button>

              <ActionButton
                variant="primary"
                loading={
                  pendingAction ===
                  "draft"
                }
                loadingText="Saving…"
                onClick={
                  handleSaveBeforeExit
                }
              >
                Save Draft
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}