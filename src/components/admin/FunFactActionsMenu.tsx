"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { deleteFunFact } from "@/app/admin/fun-facts/actions";
import ActionSpinner from "@/components/admin/ActionSpinner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const DELETE_STORAGE_KEY =
  "compass-fun-fact-deleted";

type FunFactActionsMenuProps = {
  funFactId: string;
  funFactTitle: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

export default function FunFactActionsMenu({
  funFactId,
  funFactTitle,
}: FunFactActionsMenuProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const [
    menuPosition,
    setMenuPosition,
  ] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });

  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const deleteButtonRef =
    useRef<HTMLButtonElement>(null);

  function updateMenuPosition() {
    if (!buttonRef.current) {
      return;
    }

    const buttonRect =
      buttonRef.current.getBoundingClientRect();

    const menuWidth = 144;
    const menuHeight = 104;
    const viewportPadding = 12;
    const menuGap = 6;

    let left =
      buttonRect.right -
      menuWidth;

    if (
      left < viewportPadding
    ) {
      left =
        viewportPadding;
    }

    if (
      left + menuWidth >
      window.innerWidth -
        viewportPadding
    ) {
      left =
        window.innerWidth -
        menuWidth -
        viewportPadding;
    }

    let top =
      buttonRect.bottom +
      menuGap;

    const spaceBelow =
      window.innerHeight -
      buttonRect.bottom -
      viewportPadding;

    const spaceAbove =
      buttonRect.top -
      viewportPadding;

    if (
      spaceBelow < menuHeight &&
      spaceAbove > menuHeight
    ) {
      top =
        buttonRect.top -
        menuHeight -
        menuGap;
    }

    setMenuPosition({
      top,
      left,
    });
  }

  function toggleMenu() {
    if (isDeleting) {
      return;
    }

    if (!isOpen) {
      updateMenuPosition();
    }

    setIsOpen(
      (current) =>
        !current,
    );
  }

  function openDeleteModal() {
    if (isDeleting) {
      return;
    }

    setIsOpen(false);
    setDeleteError("");
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteError("");
  }

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteFunFact(
        funFactId,
      );

      sessionStorage.setItem(
        DELETE_STORAGE_KEY,
        JSON.stringify({
          title:
            funFactTitle,
          timestamp:
            Date.now(),
        }),
      );

      window.dispatchEvent(
        new Event(
          "fun-fact-deleted",
        ),
      );

      setShowDeleteModal(
        false,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to delete Fun Fact:",
        error,
      );

      setDeleteError(
        "The Fun Fact could not be deleted. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      const clickedButton =
        buttonRef.current?.contains(
          target,
        );

      const clickedMenu =
        menuRef.current?.contains(
          target,
        );

      if (
        !clickedButton &&
        !clickedMenu
      ) {
        setIsOpen(false);
      }
    }

    function handlePositionChange() {
      updateMenuPosition();
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    window.addEventListener(
      "resize",
      handlePositionChange,
    );

    window.addEventListener(
      "scroll",
      handlePositionChange,
      true,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      window.removeEventListener(
        "resize",
        handlePositionChange,
      );

      window.removeEventListener(
        "scroll",
        handlePositionChange,
        true,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      !isOpen &&
      !showDeleteModal
    ) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key !==
        "Escape" ||
        isDeleting
      ) {
        return;
      }

      if (
        showDeleteModal
      ) {
        setShowDeleteModal(
          false,
        );

        setDeleteError("");

        buttonRef.current?.focus();

        return;
      }

      setIsOpen(false);

      buttonRef.current?.focus();
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    isOpen,
    showDeleteModal,
    isDeleting,
  ]);

  useEffect(() => {
    if (!showDeleteModal) {
      return;
    }

    const frame =
      requestAnimationFrame(
        () => {
          deleteButtonRef.current?.focus();
        },
      );

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [showDeleteModal]);

  return (
    <>
      {/* ACTION TRIGGER */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        disabled={isDeleting}
        aria-label={`Actions for ${funFactTitle}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`
          ${jakarta.className}
          inline-flex h-10 w-10
          items-center justify-center
          text-[#8D7765]
          transition
          hover:text-[#27430D]
          focus:outline-none
          focus:ring-2
          focus:ring-[#687704]/20
          disabled:cursor-not-allowed
          disabled:opacity-40
        `}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="5"
            r="1.6"
          />

          <circle
            cx="12"
            cy="12"
            r="1.6"
          />

          <circle
            cx="12"
            cy="19"
            r="1.6"
          />
        </svg>
      </button>

      {/* MENU */}
      {isOpen &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              top:
                menuPosition.top,
              left:
                menuPosition.left,
            }}
            className={`
              ${jakarta.className}
              fixed z-9999
              w-36
              overflow-hidden
              rounded-xl
              border border-[#27430D]/10
              bg-white
              p-1.5
              shadow-[0_10px_35px_rgba(39,67,13,0.16)]
            `}
          >
            <Link
              href={`/admin/fun-facts/${funFactId}`}
              role="menuitem"
              onClick={() =>
                setIsOpen(
                  false,
                )
              }
              className="
                flex w-full
                items-center
                rounded-lg
                px-3 py-2.5
                text-left
                text-sm font-medium
                text-[#27430D]
                transition
                hover:bg-[#F6F1EA]
              "
            >
              Edit
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={
                openDeleteModal
              }
              disabled={isDeleting}
              className="
                flex w-full
                items-center
                rounded-lg
                px-3 py-2.5
                text-left
                text-sm font-medium
                text-red-600
                transition
                hover:bg-red-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Delete
            </button>
          </div>,
          document.body,
        )}

      {/* DELETE CONFIRMATION */}
      {showDeleteModal &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            className={`
              ${jakarta.className}
              fixed inset-0 z-10000
              flex items-center justify-center
              bg-black/35
              px-4
              backdrop-blur-[2px]
            `}
            onMouseDown={(
              event,
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDeleteModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-fun-fact-title"
              aria-describedby="delete-fun-fact-description"
              aria-busy={
                isDeleting
              }
              className="
                w-full max-w-md
                rounded-2xl
                border border-[#27430D]/10
                bg-white
                p-6
                shadow-[0_24px_70px_rgba(39,67,13,0.22)]
                sm:p-7
              "
            >
              <div>
                <h2
                  id="delete-fun-fact-title"
                  className="text-xl font-bold tracking-tight text-[#27430D]"
                >
                  {isDeleting
                    ? "Deleting Fun Fact…"
                    : "Delete Fun Fact?"}
                </h2>

                <p
                  id="delete-fun-fact-description"
                  className="mt-2 text-sm leading-6 text-[#523A23]/60"
                >
                  {isDeleting ? (
                    <>
                      Please wait while{" "}
                      <span className="font-semibold text-[#523A23]">
                        “
                        {
                          funFactTitle
                        }
                        ”
                      </span>{" "}
                      is being deleted.
                    </>
                  ) : (
                    <>
                      You&apos;re about
                      to permanently
                      delete{" "}
                      <span className="font-semibold text-[#523A23]">
                        “
                        {
                          funFactTitle
                        }
                        ”
                      </span>
                      . This action
                      cannot be undone.
                    </>
                  )}
                </p>
              </div>

              {isDeleting && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-5 flex items-center gap-3 rounded-xl border border-[#27430D]/10 bg-[#F6F1EA]/60 px-4 py-3"
                >
                  <div className="text-[#687704]">
                    <ActionSpinner />
                  </div>

                  <p className="text-sm font-medium text-[#523A23]/70">
                    Removing Fun Fact
                    and updating the
                    list…
                  </p>
                </div>
              )}

              {deleteError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {deleteError}
                </div>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeDeleteModal
                  }
                  disabled={
                    isDeleting
                  }
                  className="
                    inline-flex h-11
                    items-center justify-center
                    rounded-xl
                    border border-[#27430D]/15
                    bg-white
                    px-5
                    text-sm font-semibold
                    text-[#27430D]
                    transition
                    hover:bg-[#F6F1EA]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  ref={
                    deleteButtonRef
                  }
                  type="button"
                  onClick={
                    handleDelete
                  }
                  disabled={
                    isDeleting
                  }
                  className="
                    inline-flex h-11
                    min-w-36
                    items-center justify-center
                    gap-2
                    rounded-xl
                    bg-red-600
                    px-5
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-red-700
                    focus:outline-none
                    focus:ring-4
                    focus:ring-red-600/15
                    disabled:cursor-wait
                    disabled:opacity-75
                  "
                >
                  {isDeleting ? (
                    <>
                      <ActionSpinner />

                      <span>
                        Deleting…
                      </span>
                    </>
                  ) : (
                    "Delete Fun Fact"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}