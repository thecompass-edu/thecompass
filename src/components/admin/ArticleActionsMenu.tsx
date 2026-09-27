"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { createPortal } from "react-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { deleteArticle } from "@/app/admin/articles/actions";

import ActionButton from "@/components/admin/ActionButton";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const DELETE_STORAGE_KEY =
  "compass-article-deleted";

type ArticleActionsMenuProps = {
  articleId: string;
  articleTitle: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

export default function ArticleActionsMenu({
  articleId,
  articleTitle,
}: ArticleActionsMenuProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    menuPosition,
    setMenuPosition,
  ] = useState<MenuPosition>({
    top: 0,
    left: 0,
  });

  const buttonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const menuRef =
    useRef<HTMLDivElement>(
      null,
    );

  const deleteButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

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
      left <
      viewportPadding
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
      spaceBelow <
        menuHeight &&
      spaceAbove >
        menuHeight
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

    setShowDeleteModal(
      true,
    );
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setShowDeleteModal(
      false,
    );

    setDeleteError("");
  }

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    setDeleteError("");

    try {
      await deleteArticle(
        articleId,
      );

      sessionStorage.setItem(
        DELETE_STORAGE_KEY,
        JSON.stringify({
          title:
            articleTitle,
          timestamp:
            Date.now(),
        }),
      );

      window.dispatchEvent(
        new Event(
          "article-deleted",
        ),
      );

      setShowDeleteModal(
        false,
      );
    } catch (error) {
      console.error(
        "Failed to delete article:",
        error,
      );

      setDeleteError(
        "The article could not be deleted. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /*
   * Close the dropdown when the
   * admin clicks somewhere else.
   *
   * Recalculate position whenever
   * the viewport changes.
   */
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

  /*
   * Escape closes the currently
   * open menu or modal.
   *
   * While deletion is happening,
   * the modal cannot be dismissed.
   */
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
        "Escape"
      ) {
        return;
      }

      if (isDeleting) {
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

      if (isOpen) {
        setIsOpen(false);

        buttonRef.current?.focus();
      }
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

  /*
   * Focus the destructive action
   * when the confirmation dialog opens.
   */
  useEffect(() => {
    if (
      !showDeleteModal
    ) {
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
  }, [
    showDeleteModal,
  ]);

  return (
    <>
      {/* Action Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={
          toggleMenu
        }
        disabled={
          isDeleting
        }
        aria-label={`Actions for ${articleTitle}`}
        aria-haspopup="menu"
        aria-expanded={
          isOpen
        }
        className={`
          ${jakarta.className}

          inline-flex
          h-9 w-9
          items-center
          justify-center
          rounded-lg

          text-[#523A23]/55

          transition

          hover:bg-[#F6F1EA]
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

      {/* Edit / Delete Menu */}
      {isOpen &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            ref={
              menuRef
            }
            role="menu"
            style={{
              top:
                menuPosition.top,
              left:
                menuPosition.left,
            }}
            className={`
              ${jakarta.className}

              fixed
              z-9999

              w-36
              overflow-hidden

              rounded-xl
              border
              border-[#27430D]/10

              bg-white

              p-1.5

              shadow-[0_10px_35px_rgba(39,67,13,0.16)]
            `}
          >
            <Link
              href={`/admin/articles/${articleId}`}
              role="menuitem"
              onClick={() =>
                setIsOpen(
                  false,
                )
              }
              className="
                flex
                w-full
                items-center

                rounded-lg

                px-3
                py-2.5

                text-left
                text-sm
                font-medium
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
              disabled={
                isDeleting
              }
              className="
                flex
                w-full
                items-center

                rounded-lg

                px-3
                py-2.5

                text-left
                text-sm
                font-medium
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal &&
        typeof document !==
          "undefined" &&
        createPortal(
          <div
            className={`
              ${jakarta.className}

              fixed
              inset-0
              z-10000

              flex
              items-center
              justify-center

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
              aria-labelledby="delete-article-title"
              aria-describedby="delete-article-description"
              aria-busy={
                isDeleting
              }
              className="
                w-full
                max-w-md

                rounded-2xl

                border
                border-[#27430D]/10

                bg-white

                p-6

                shadow-[0_24px_70px_rgba(39,67,13,0.22)]

                sm:p-7
              "
            >
              <div>
                <h2
                  id="delete-article-title"
                  className="text-xl font-bold tracking-tight text-[#27430D]"
                >
                  {isDeleting
                    ? "Deleting article…"
                    : "Delete article?"}
                </h2>

                <p
                  id="delete-article-description"
                  className="mt-2 text-sm leading-6 text-[#523A23]/60"
                >
                  {isDeleting ? (
                    <>
                      Please wait
                      while{" "}
                      <span className="font-semibold text-[#523A23]">
                        “
                        {
                          articleTitle
                        }
                        ”
                      </span>{" "}
                      is being
                      deleted.
                    </>
                  ) : (
                    <>
                      You&apos;re
                      about to
                      permanently
                      delete{" "}
                      <span className="font-semibold text-[#523A23]">
                        “
                        {
                          articleTitle
                        }
                        ”
                      </span>
                      . This action
                      cannot be
                      undone.
                    </>
                  )}
                </p>
              </div>

              {/* Delete Error */}
              {deleteError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {
                    deleteError
                  }
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <ActionButton
                  variant="secondary"
                  disabled={
                    isDeleting
                  }
                  onClick={
                    closeDeleteModal
                  }
                >
                  Cancel
                </ActionButton>

                <ActionButton
                  ref={
                    deleteButtonRef
                  }
                  variant="danger"
                  loading={
                    isDeleting
                  }
                  loadingText="Deleting…"
                  onClick={
                    handleDelete
                  }
                  className="min-w-36"
                >
                  Delete Article
                </ActionButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}