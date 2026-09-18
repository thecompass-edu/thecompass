"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import ConfirmationModal from "@/components/admin/ConfirmationModal";

type FormValue =
  | string
  | File;

function serializeValue(
  value: FormValue,
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (value.size === 0) {
    return "";
  }

  return [
    value.name,
    value.size,
    value.type,
    value.lastModified,
  ].join(":");
}

function serializeForm(
  form: HTMLFormElement,
) {
  const entries = Array.from(
    new FormData(form).entries(),
  ).map(([name, value]) => [
    name,
    serializeValue(value),
  ]);

  return JSON.stringify(entries);
}

export default function UnsavedChangesGuard() {
  const router = useRouter();

  const markerRef =
    useRef<HTMLSpanElement>(null);

  const initialSnapshotRef =
    useRef<string | null>(null);

  const isSubmittingRef =
    useRef(false);

  const bypassNavigationRef =
    useRef(false);

  const [
    pendingHref,
    setPendingHref,
  ] = useState<string | null>(
    null,
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const getForm =
    useCallback(() => {
      return (
        markerRef.current?.closest(
          "form",
        ) ?? null
      );
    }, []);

  const hasUnsavedChanges =
    useCallback(() => {
      const form = getForm();

      if (
        !form ||
        !initialSnapshotRef.current
      ) {
        return false;
      }

      return (
        serializeForm(form) !==
        initialSnapshotRef.current
      );
    }, [getForm]);

  useEffect(() => {
    const form = getForm();

    if (!form) {
      return;
    }

    // Capture the original form after client fields finish mounting.
    const timeout =
      window.setTimeout(() => {
        initialSnapshotRef.current =
          serializeForm(form);
      }, 100);

    function handleSubmit() {
      isSubmittingRef.current =
        true;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (
        isSubmittingRef.current ||
        bypassNavigationRef.current ||
        !hasUnsavedChanges()
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(
      event: MouseEvent,
    ) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        isSubmittingRef.current ||
        bypassNavigationRef.current
      ) {
        return;
      }

      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      const anchor =
        target.closest<HTMLAnchorElement>(
          "a[href]",
        );

      if (
        !anchor ||
        anchor.hasAttribute(
          "download",
        ) ||
        (anchor.target &&
          anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(
        anchor.href,
        window.location.href,
      );

      if (
        url.origin !==
          window.location.origin ||
        url.href ===
          window.location.href ||
        !hasUnsavedChanges()
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      setPendingHref(
        `${url.pathname}${url.search}${url.hash}`,
      );

      setModalOpen(true);
    }

    form.addEventListener(
      "submit",
      handleSubmit,
      true,
    );

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    document.addEventListener(
      "click",
      handleDocumentClick,
      true,
    );

    return () => {
      window.clearTimeout(
        timeout,
      );

      form.removeEventListener(
        "submit",
        handleSubmit,
        true,
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );

      document.removeEventListener(
        "click",
        handleDocumentClick,
        true,
      );
    };
  }, [
    getForm,
    hasUnsavedChanges,
  ]);

  function handleKeepEditing() {
    setModalOpen(false);
    setPendingHref(null);
  }

  function handleExitWithoutSaving() {
    if (!pendingHref) {
      return;
    }

    bypassNavigationRef.current =
      true;

    setModalOpen(false);

    router.push(pendingHref);
  }

  return (
    <>
      <span
        ref={markerRef}
        className="hidden"
        aria-hidden="true"
      />

      <ConfirmationModal
        open={modalOpen}
        title="Unsaved changes"
        description="You have changes that haven't been saved. If you leave now, those changes will be lost."
        confirmLabel="Exit without saving"
        cancelLabel="Keep editing"
        variant="danger"
        onCancel={
          handleKeepEditing
        }
        onConfirm={
          handleExitWithoutSaving
        }
      />
    </>
  );
}