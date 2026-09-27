"use client";

import {
  type FormEvent,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import ArticleEditor from "@/components/admin/ArticleEditor";
import AuthorsInput from "@/components/admin/AuthorsInput";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";

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
  const formRef =
    useRef<HTMLFormElement>(null);

  const detailsToggleRef =
    useRef<HTMLInputElement>(null);

  // Hidden buttons handle the real form submission.
  const draftSubmitRef =
    useRef<HTMLButtonElement>(null);

  const publishSubmitRef =
    useRef<HTMLButtonElement>(null);


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
    hasUnsavedChanges,
    setHasUnsavedChanges,
  ] = useState(false);

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

  // Track changes and clear validation as fields are fixed.
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

  // Handle the visible Save Draft and Publish buttons.
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


    // Saving a draft is safe, so submit it right away.
    if (action === "draft") {
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

      return;
    }

    // Publishing changes the public site, so confirm it first.
    setConfirmationAction(
      "published",
    );
  }

  function handleConfirmAction() {
    const form =
      formRef.current;

    if (
      !form ||
      confirmationAction !==
        "published" ||
      pendingAction ||
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
  }

  // Store the success toast before the server action runs.
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
        <UnsavedChangesGuard />

        {/* Hidden submit buttons */}
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
                      ? "[&_.border-dashed]:border-red-500!"
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
                          [&_input]:border-red-500!
                          [&_input]:ring-4!
                          [&_input]:ring-red-500/10!
                          [&_input:focus]:border-red-500!
                          [&_input:focus]:ring-red-500/10!
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

      <ConfirmationModal
        open={
          confirmationAction ===
          "published"
        }
        title={
          pendingAction ===
          "published"
            ? "Publishing article…"
            : "Publish article?"
        }
        description={
          pendingAction ===
          "published"
            ? "Please wait while the article is being published."
            : "This article will become visible on the public website."
        }
        subjectLabel="Article"
        subject={
          title.trim() ||
          "Untitled article"
        }
        confirmLabel="Publish"
        loadingLabel="Publishing…"
        variant="primary"
        loading={
          pendingAction ===
          "published"
        }
        onCancel={() =>
          setConfirmationAction(
            null,
          )
        }
        onConfirm={
          handleConfirmAction
        }
      />

    </div>
  );
}