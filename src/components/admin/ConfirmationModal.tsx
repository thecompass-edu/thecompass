"use client";

import {
  useEffect,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

import ActionButton from "@/components/admin/ActionButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

type ModalVariant =
  | "primary"
  | "accent"
  | "danger";

type ConfirmationModalProps = {
  open: boolean;

  title: string;
  description: string;

  subjectLabel?: string;
  subject?: string;

  confirmLabel: string;
  loadingLabel?: string;

  cancelLabel?: string;

  variant?: ModalVariant;

  loading?: boolean;

  onConfirm: () => void;
  onCancel: () => void;

  secondaryLabel?: string;
  secondaryVariant?: ModalVariant;
  onSecondary?: () => void;
};

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

export default function ConfirmationModal({
  open,
  title,
  description,
  subjectLabel,
  subject,
  confirmLabel,
  loadingLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
  secondaryLabel,
  secondaryVariant = "danger",
  onSecondary,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        onCancel();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    loading,
    onCancel,
  ]);

  if (
    !open ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      className={`${jakarta.className} fixed inset-0 z-120 flex items-center justify-center bg-[#1A1A1A]/40 px-4 py-8 backdrop-blur-[2px]`}
      onMouseDown={(event) => {
        if (
          !loading &&
          event.target ===
            event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        aria-busy={loading}
        className="w-full max-w-md rounded-2xl border border-[#27430D]/10 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h2
              id="confirmation-modal-title"
              className="text-xl font-semibold tracking-tight text-[#27430D]"
            >
              {title}
            </h2>

            <p
              id="confirmation-modal-description"
              className="mt-2 text-sm leading-6 text-[#523A23]/60"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close confirmation"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#523A23]/45 transition hover:bg-[#F6F1EA] hover:text-[#27430D] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloseIcon />
          </button>
        </div>

        {subject && (
          <div className="mt-6 rounded-xl border border-[#27430D]/10 bg-[#F9F7F3] px-4 py-3">
            {subjectLabel && (
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#687704]">
                {subjectLabel}
              </p>
            )}

            <p className="mt-1 truncate text-sm font-semibold text-[#27430D]">
              {subject}
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {secondaryLabel &&
            onSecondary && (
              <ActionButton
                variant={
                  secondaryVariant
                }
                disabled={loading}
                onClick={
                  onSecondary
                }
              >
                {secondaryLabel}
              </ActionButton>
            )}

          <ActionButton
            variant="secondary"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </ActionButton>

          <ActionButton
            variant={variant}
            loading={loading}
            loadingText={
              loadingLabel
            }
            onClick={onConfirm}
            className="min-w-32"
          >
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
