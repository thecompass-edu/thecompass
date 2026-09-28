"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";

import ActionSpinner from "@/components/admin/ActionSpinner";
import FunFactImageUpload from "@/components/admin/FunFactImageUpload";

const FUN_FACT_TOAST_STORAGE_KEY =
  "compass-fun-fact-saved";

function passthroughImageLoader({ src }: ImageLoaderProps) {
  return src;
}

type FunFactEditorValues = {
  title?: string;
  description?: string;
  fun_fact_number?: number | null;
  image_url?: string | null;
  status?: "draft" | "published";
};

type FunFactEditorProps = {
  mode: "create" | "edit";

  action: (
    formData: FormData,
  ) => void | Promise<void>;

  error?: string;

  funFactId?: string;

  initialValues?: FunFactEditorValues;
};

type FunFactAction =
  | "draft"
  | "published";

type ValidationField =
  | "title"
  | "fun_fact_number"
  | "description"
  | "image_url";

function RequiredError({
  message = "This field is required.",
}: {
  message?: string;
}) {
  return (
    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
      <span
        aria-hidden="true"
        className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold"
      >
        !
      </span>

      {message}
    </p>
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

export default function FunFactEditor({
  mode,
  action,
  error,
  initialValues,
}: FunFactEditorProps) {
  const formRef =
    useRef<HTMLFormElement>(null);

  const draftSubmitRef =
    useRef<HTMLButtonElement>(null);

  const publishSubmitRef =
    useRef<HTMLButtonElement>(null);

  const validationActionRef =
    useRef<FunFactAction>("draft");

  const [title, setTitle] = useState(
    initialValues?.title ?? "",
  );

  const [description, setDescription] =
    useState(
      initialValues?.description ?? "",
    );

  const [
    funFactNumber,
    setFunFactNumber,
  ] = useState(
    initialValues?.fun_fact_number?.toString() ??
      "",
  );

  const [imageUrl, setImageUrl] =
    useState(
      initialValues?.image_url ?? "",
    );

  const [uploading, setUploading] =
    useState(false);

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
    useState<FunFactAction | null>(
      null,
    );

  const [
    pendingAction,
    setPendingAction,
  ] =
    useState<FunFactAction | null>(
      null,
    );

  const isEdit =
    mode === "edit";

  const currentStatus =
    initialValues?.status ??
    "draft";

  // Clear the pending toast after a failed action.
useEffect(() => {
  if (!error) {
    return;
  }

  sessionStorage.removeItem(
    FUN_FACT_TOAST_STORAGE_KEY,
  );

  const timeout =
    window.setTimeout(() => {
      setPendingAction(null);
      setConfirmationAction(null);
    }, 0);

  return () => {
    window.clearTimeout(timeout);
  };
}, [error]);
  // Close confirmation with Escape.
  useEffect(() => {
    if (!confirmationAction) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key !== "Escape" ||
        pendingAction
      ) {
        return;
      }

      setConfirmationAction(
        null,
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
    pendingAction,
  ]);

  // Lock page scroll while the modal is open.
  useEffect(() => {
    if (!confirmationAction) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [confirmationAction]);

  function getMissingFields(
    actionType: FunFactAction,
  ) {
    const missing:
      ValidationField[] = [];

    if (!title.trim()) {
      missing.push("title");
    }

    const parsedNumber =
      Number(funFactNumber);

    if (
      !funFactNumber.trim() ||
      !Number.isInteger(
        parsedNumber,
      ) ||
      parsedNumber < 1
    ) {
      missing.push(
        "fun_fact_number",
      );
    }

    if (!description.trim()) {
      missing.push(
        "description",
      );
    }

    // Published Fun Facts need an image.
    if (
      actionType ===
        "published" &&
      !imageUrl
    ) {
      missing.push(
        "image_url",
      );
    }

    return missing;
  }

  function showValidationErrors(
    missingFields:
      ValidationField[],
  ) {
    setInvalidFields(
      new Set(missingFields),
    );

    requestAnimationFrame(() => {
      const firstMissingField =
        missingFields[0];

      if (!firstMissingField) {
        return;
      }

      const element =
        formRef.current?.querySelector<HTMLElement>(
          `[data-validation-field="${firstMissingField}"]`,
        );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  // Validate before opening confirmation.
  function handleActionClick(
    actionType: FunFactAction,
  ) {
    if (
      uploading ||
      pendingAction
    ) {
      return;
    }

    validationActionRef.current =
      actionType;

    const missingFields =
      getMissingFields(
        actionType,
      );

    if (
      missingFields.length > 0
    ) {
      showValidationErrors(
        missingFields,
      );

      return;
    }

    setInvalidFields(
      new Set(),
    );

    setConfirmationAction(
      actionType,
    );
  }

  // Submit through the hidden form buttons.
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

    const selectedAction =
      confirmationAction;

    setPendingAction(
      selectedAction,
    );

    if (
      selectedAction ===
      "published"
    ) {
      if (
        !publishSubmitRef.current
      ) {
        setPendingAction(null);
        return;
      }

      form.requestSubmit(
        publishSubmitRef.current,
      );

      return;
    }

    if (!draftSubmitRef.current) {
      setPendingAction(null);
      return;
    }

    form.requestSubmit(
      draftSubmitRef.current,
    );
  }

  // Clear validation as fields are fixed.
  function handleFormInput() {
    if (
      invalidFields.size === 0
    ) {
      return;
    }

    const missingFields =
      getMissingFields(
        validationActionRef.current,
      );

    setInvalidFields(
      new Set(
        missingFields,
      ),
    );
  }

  function handleImageChange(
    url: string,
  ) {
    setImageUrl(url);

    if (
      url &&
      invalidFields.has(
        "image_url",
      )
    ) {
      setInvalidFields(
        (current) => {
          const next =
            new Set(current);

          next.delete(
            "image_url",
          );

          return next;
        },
      );
    }
  }

  // Save the toast before the server redirect.
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

    const status:
      FunFactAction =
      submitter.value ===
      "published"
        ? "published"
        : "draft";

    sessionStorage.setItem(
      FUN_FACT_TOAST_STORAGE_KEY,
      JSON.stringify({
        title:
          title.trim() ||
          "Untitled Fun Fact",
        status,
        timestamp: Date.now(),
      }),
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <form
        ref={formRef}
        action={action}
        noValidate
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

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[#27430D]/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-24 items-center justify-between gap-5 px-6 sm:px-8 lg:px-10">

            <Link
              href="/admin/fun-facts"
              className="flex shrink-0 items-center gap-3 text-[15px] font-medium text-[#8D7765] transition hover:text-[#27430D]"
            >
              <span className="text-lg">
                ←
              </span>

              <span>
                Fun Facts
              </span>
            </Link>

            {/* Right */}
            <div className="flex items-center gap-4">

              <div className="hidden items-center gap-2 rounded-full border border-[#27430D]/10 bg-white px-4 py-2 text-sm font-medium text-[#8D7765] sm:flex">
                <span
                  className={`h-2 w-2 rounded-full ${
                    currentStatus ===
                    "published"
                      ? "bg-[#27430D]"
                      : "bg-[#718F14]"
                  }`}
                />

                <span>
                  {currentStatus ===
                  "published"
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              <p className="hidden text-sm text-[#8D7765]/50 lg:block">
                {isEdit
                  ? "Changes not saved"
                  : "Not saved yet"}
              </p>


              <button
                type="button"
                onClick={() =>
                  handleActionClick(
                    "draft",
                  )
                }
                disabled={
                  uploading ||
                  Boolean(
                    pendingAction,
                  )
                }
                className="
                  hidden
                  h-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#27430D]/20
                  bg-white
                  px-7
                  text-base
                  font-semibold
                  text-[#27430D]
                  transition
                  hover:bg-[#F8F5EC]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:inline-flex
                "
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
                disabled={
                  uploading ||
                  Boolean(
                    pendingAction,
                  )
                }
                className="
                  inline-flex
                  h-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#27430D]
                  px-8
                  text-base
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#35591A]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {uploading
                  ? "Uploading..."
                  : "Publish"}
              </button>
            </div>
          </div>
        </header>

        {/* Editor */}
        <main className="px-6 pt-4 pb-9 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">

              <div className="rounded-[20px] border border-[#DCE3ED] bg-white p-7 sm:p-8">
                <div className="space-y-7">
                  {/* Title */}
                  <div
                    data-validation-field="title"
                  >
                    <label
                      htmlFor="title"
                      className="block text-[15px] font-semibold text-slate-900"
                    >
                      Title
                    </label>

                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={(
                        event,
                      ) =>
                        setTitle(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter Fun Fact title"
                      aria-invalid={
                        invalidFields.has(
                          "title",
                        )
                          ? true
                          : undefined
                      }
                      className={`mt-3 h-13 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-[#98A8C4] ${
                        invalidFields.has(
                          "title",
                        )
                          ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#D8E0EC] focus:border-[#718F14] focus:ring-2 focus:ring-[#718F14]/10"
                      }`}
                    />

                    {invalidFields.has(
                      "title",
                    ) && (
                      <RequiredError />
                    )}
                  </div>

                  {/* Fun Fact number */}
                  <div
                    data-validation-field="fun_fact_number"
                  >
                    <label
                      htmlFor="fun_fact_number"
                      className="block text-[15px] font-semibold text-slate-900"
                    >
                      Weekly Fun Fact #
                    </label>

                    <input
                      id="fun_fact_number"
                      name="fun_fact_number"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        funFactNumber
                      }
                      onChange={(
                        event,
                      ) =>
                        setFunFactNumber(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Example: 12"
                      aria-invalid={
                        invalidFields.has(
                          "fun_fact_number",
                        )
                          ? true
                          : undefined
                      }
                      className={`mt-3 h-13 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-[#98A8C4] ${
                        invalidFields.has(
                          "fun_fact_number",
                        )
                          ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#D8E0EC] focus:border-[#718F14] focus:ring-2 focus:ring-[#718F14]/10"
                      }`}
                    />

                    {invalidFields.has(
                      "fun_fact_number",
                    ) ? (
                      <RequiredError message="Enter a positive whole number." />
                    ) : (
                      <p className="mt-2 text-[13px] text-[#8EA0C0]">
                        The publication
                        date is
                        automatically
                        added when you
                        publish.
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div
                    data-validation-field="description"
                  >
                    <label
                      htmlFor="description"
                      className="block text-[15px] font-semibold text-slate-900"
                    >
                      Description
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={description}
                      onChange={(
                        event,
                      ) =>
                        setDescription(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Add a short description for this Fun Fact..."
                      aria-invalid={
                        invalidFields.has(
                          "description",
                        )
                          ? true
                          : undefined
                      }
                      className={`mt-3 w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] leading-6 text-slate-900 outline-none transition placeholder:text-[#98A8C4] ${
                        invalidFields.has(
                          "description",
                        )
                          ? "border-red-500 ring-4 ring-red-500/10 focus:border-red-500 focus:ring-red-500/10"
                          : "border-[#D8E0EC] focus:border-[#718F14] focus:ring-2 focus:ring-[#718F14]/10"
                      }`}
                    />

                    {invalidFields.has(
                      "description",
                    ) && (
                      <RequiredError />
                    )}
                  </div>

                  {/* Image */}
                  <div
                    data-validation-field="image_url"
                  >
                    <div
                      className={
                        invalidFields.has(
                          "image_url",
                        )
                          ? `
                            [&_.border-dashed]:border-red-500!
                            [&_.border-dashed]:ring-4!
                            [&_.border-dashed]:ring-red-500/10!
                          `
                          : ""
                      }
                    >
                      <FunFactImageUpload
                        initialImageUrl={
                          initialValues?.image_url ??
                          ""
                        }
                        onImageChange={
                          handleImageChange
                        }
                        onUploadingChange={
                          setUploading
                        }
                      />
                    </div>

                    {invalidFields.has(
                      "image_url",
                    ) && (
                      <RequiredError message="Add an image before publishing." />
                    )}
                  </div>

                  {/* Mobile draft */}
                  <div className="border-t border-[#E5EAF1] pt-7 sm:hidden">
                    <button
                      type="button"
                      onClick={() =>
                        handleActionClick(
                          "draft",
                        )
                      }
                      disabled={
                        uploading ||
                        Boolean(
                          pendingAction,
                        )
                      }
                      className="
                        inline-flex
                        h-12
                        w-full
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[#CBD5E1]
                        bg-white
                        px-5
                        text-sm
                        font-semibold
                        text-slate-700
                        transition
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Story preview */}
              <aside className="lg:sticky lg:top-28">
                <p className="mb-4 text-xs font-bold tracking-[0.16em] text-[#8C9AB4]">
                  STORY PREVIEW
                </p>

                <div className="mx-auto w-full max-w-85">
                  <div className="relative aspect-9/16 overflow-hidden rounded-[28px] border border-[#DCE3ED] bg-[#F3F6FA] shadow-sm">
                    {imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt="Fun Fact story preview"
                          fill
                          sizes="340px"
                          loader={passthroughImageLoader}
                          unoptimized
                          className="object-cover object-top"
                        />

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-black/65 via-black/25 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                          {funFactNumber && (
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                              Fun Fact #
                              {
                                funFactNumber
                              }
                            </p>
                          )}

                          {title && (
                            <h2 className="mt-2 text-xl font-bold leading-tight">
                              {title}
                            </h2>
                          )}

                          {description && (
                            <p className="mt-3 line-clamp-3 text-sm leading-5 text-white/80">
                              {
                                description
                              }
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center px-10 text-center">
                        <p className="text-[15px] leading-6 text-[#91A3C4]">
                          Your Fun Fact
                          image will appear
                          here.
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-center text-xs leading-5 text-[#9AA8BF]">
                    Preview shown in a
                    9:16 story format.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </form>

      {/* Confirmation modal */}
      {confirmationAction && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#1A1A1A]/40 px-4 backdrop-blur-[2px]"
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
            aria-labelledby="fun-fact-confirmation-title"
            aria-describedby="fun-fact-confirmation-description"
            aria-busy={Boolean(
              pendingAction,
            )}
            className="w-full max-w-md rounded-2xl border border-[#27430D]/10 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <h2
                  id="fun-fact-confirmation-title"
                  className="text-xl font-semibold tracking-tight text-[#27430D]"
                >
                  {pendingAction ===
                  "published"
                    ? "Publishing Fun Fact…"
                    : pendingAction ===
                        "draft"
                      ? "Saving draft…"
                      : confirmationAction ===
                          "published"
                        ? "Publish Fun Fact?"
                        : "Save as draft?"}
                </h2>

                <p
                  id="fun-fact-confirmation-description"
                  className="mt-2 text-sm leading-6 text-[#523A23]/60"
                >
                  {pendingAction ===
                  "published"
                    ? "Please wait while the Fun Fact is being published."
                    : pendingAction ===
                        "draft"
                      ? "Please wait while your draft is being saved."
                      : confirmationAction ===
                          "published"
                        ? "This Fun Fact will become visible on the public website."
                        : "This Fun Fact will be saved as a draft and can be published later."}
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

            {/* Fun Fact preview */}
            <div className="mt-6 rounded-xl border border-[#27430D]/10 bg-[#F9F7F3] px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#687704]">
                Fun Fact
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-[#27430D]">
                {title.trim() ||
                  "Untitled Fun Fact"}
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
                className="rounded-xl border border-[#27430D]/15 bg-white px-5 py-3 text-sm font-semibold text-[#27430D] transition hover:bg-[#F6F1EA] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmAction
                }
                disabled={Boolean(
                  pendingAction,
                )}
                className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-75 ${
                  confirmationAction ===
                  "published"
                    ? "bg-[#27430D] hover:bg-[#687704]"
                    : "bg-[#687704] hover:bg-[#596604]"
                }`}
              >
                {pendingAction ? (
                  <>
                    <ActionSpinner />

                    <span>
                      {confirmationAction ===
                      "published"
                        ? "Publishing…"
                        : "Saving…"}
                    </span>
                  </>
                ) : confirmationAction ===
                  "published" ? (
                  "Publish"
                ) : (
                  "Save Draft"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}