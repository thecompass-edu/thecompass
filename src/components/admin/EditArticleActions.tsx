"use client";

import {
  useRef,
  useState,
} from "react";

import {
  useFormStatus,
} from "react-dom";

import ConfirmationModal from "@/components/admin/ConfirmationModal";

const ARTICLE_UPDATED_STORAGE_KEY =
  "compass-article-updated";

type ArticleStatus =
  | "draft"
  | "published";

type UpdateAction =
  | "draft"
  | "published"
  | "updated"
  | "unpublished";

type ConfirmationAction =
  | "publish"
  | "update"
  | "unpublish";

type EditArticleActionsProps = {
  articleTitle: string;
  currentStatus: ArticleStatus;
};

export default function EditArticleActions({
  articleTitle,
  currentStatus,
}: EditArticleActionsProps) {
  const { pending } =
    useFormStatus();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const draftSubmitRef =
    useRef<HTMLButtonElement>(null);

  const publishSubmitRef =
    useRef<HTMLButtonElement>(null);

  const [
    confirmationAction,
    setConfirmationAction,
  ] =
    useState<ConfirmationAction | null>(
      null,
    );

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<ArticleStatus | null>(
      null,
    );

  const [
    confirmationTitle,
    setConfirmationTitle,
  ] = useState(articleTitle);

  function getForm() {
    return (
      containerRef.current?.closest(
        "form",
      ) ?? null
    );
  }

  function getCurrentTitle(
    form: HTMLFormElement,
  ) {
    const formData =
      new FormData(form);

    return (
      String(
        formData.get("title") ??
          "",
      ).trim() ||
      articleTitle ||
      "Untitled article"
    );
  }

  function getUpdateAction(
    nextStatus: ArticleStatus,
  ): UpdateAction {
    if (
      currentStatus === "draft" &&
      nextStatus === "published"
    ) {
      return "published";
    }

    if (
      currentStatus ===
        "published" &&
      nextStatus === "draft"
    ) {
      return "unpublished";
    }

    if (
      nextStatus === "draft"
    ) {
      return "draft";
    }

    return "updated";
  }

  function submitArticle(
    nextStatus: ArticleStatus,
  ) {
    const form = getForm();

    if (!form || pending) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const submitButton =
      nextStatus === "published"
        ? publishSubmitRef.current
        : draftSubmitRef.current;

    if (!submitButton) {
      return;
    }

    const title =
      getCurrentTitle(form);

    sessionStorage.setItem(
      ARTICLE_UPDATED_STORAGE_KEY,
      JSON.stringify({
        title,
        action:
          getUpdateAction(
            nextStatus,
          ),
        timestamp: Date.now(),
      }),
    );

    setPendingAction(
      nextStatus,
    );

    form.requestSubmit(
      submitButton,
    );
  }

  function handleAction(
    nextStatus: ArticleStatus,
  ) {
    const form = getForm();

    if (!form || pending) {
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    setConfirmationTitle(
      getCurrentTitle(form),
    );

    if (
      currentStatus === "draft" &&
      nextStatus === "draft"
    ) {
      submitArticle("draft");
      return;
    }

    if (
      currentStatus === "draft" &&
      nextStatus === "published"
    ) {
      setConfirmationAction(
        "publish",
      );

      return;
    }

    if (
      currentStatus ===
        "published" &&
      nextStatus === "draft"
    ) {
      setConfirmationAction(
        "unpublish",
      );

      return;
    }

    setConfirmationAction(
      "update",
    );
  }

  function handleConfirm() {
    if (
      confirmationAction ===
      "unpublish"
    ) {
      submitArticle("draft");
      return;
    }

    submitArticle("published");
  }

  const modalTitle =
    confirmationAction === "publish"
      ? "Publish article?"
      : confirmationAction ===
          "update"
        ? "Update article?"
        : "Move article to drafts?";

  const modalDescription =
    confirmationAction === "publish"
      ? "This article will become visible on the public website."
      : confirmationAction ===
          "update"
        ? "Your changes will immediately appear on the published article."
        : "This article will no longer be visible on the public website until you publish it again.";

  const confirmLabel =
    confirmationAction === "publish"
      ? "Publish"
      : confirmationAction ===
          "update"
        ? "Update"
        : "Move to Draft";

  const loadingLabel =
    confirmationAction === "publish"
      ? "Publishing..."
      : confirmationAction ===
          "update"
        ? "Updating..."
        : "Moving...";

  return (
    <>
      <div
        ref={containerRef}
        className="flex flex-wrap items-center gap-3"
      >
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

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handleAction("draft")
          }
          className="rounded-xl border border-[#27430D]/20 bg-white px-5 py-3 text-sm font-semibold text-[#27430D] transition hover:border-[#687704]/50 hover:bg-[#687704]/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending &&
          pendingAction === "draft"
            ? currentStatus ===
              "published"
              ? "Moving..."
              : "Saving..."
            : currentStatus ===
                "published"
              ? "Move to Draft"
              : "Save Draft"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            handleAction(
              "published",
            )
          }
          className="rounded-xl bg-[#27430D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#687704] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending &&
          pendingAction ===
            "published"
            ? currentStatus ===
              "published"
              ? "Updating..."
              : "Publishing..."
            : currentStatus ===
                "published"
              ? "Update"
              : "Publish"}
        </button>
      </div>

      <ConfirmationModal
        open={
          confirmationAction !== null
        }
        title={modalTitle}
        description={
          modalDescription
        }
        subjectLabel="Article"
        subject={
          confirmationTitle
        }
        confirmLabel={
          confirmLabel
        }
        loadingLabel={
          loadingLabel
        }
        variant={
          confirmationAction ===
          "unpublish"
            ? "accent"
            : "primary"
        }
        loading={pending}
        onCancel={() =>
          setConfirmationAction(
            null,
          )
        }
        onConfirm={
          handleConfirm
        }
      />
    </>
  );
}