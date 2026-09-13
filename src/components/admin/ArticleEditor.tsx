"use client";

import {
  ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import localFont from "next/font/local";

import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";

import { TextSelection } from "@tiptap/pm/state";

import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";

import {
  Color,
  TextStyle,
} from "@tiptap/extension-text-style";

import {
  AltArrowLeftIcon,
  AltArrowRightIcon,
  CodeIcon,
  EraserIcon,
  GalleryAddIcon,
  LinkIcon,
  MinusIcon,
  RefreshIcon,
  TextBoldIcon,
  TextCrossIcon,
  TextFormatIcon,
  TextItalicIcon,
  TextSelectionIcon,
  TextUnderlineIcon,
  UnlinkIcon,
} from "@solar-icons/react/linear";

import { createClient } from "@/lib/supabase/client";

const essays = localFont({
  src: [
    {
      path: "../../fonts/Essays1743.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Essays1743-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Essays1743-Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../fonts/Essays1743-BoldItalic.woff",
      weight: "700",
      style: "italic",
    },
  ],
  display: "swap",
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const TEXT_COLORS = [
  {
    name: "Brown",
    value: "#523A23",
  },
  {
    name: "Dark green",
    value: "#27430D",
  },
  {
    name: "Olive",
    value: "#687704",
  },
  {
    name: "Black",
    value: "#1F1F1F",
  },
  {
    name: "Gray",
    value: "#6B7280",
  },
  {
    name: "Red",
    value: "#B42318",
  },
  {
    name: "Blue",
    value: "#2563EB",
  },
  {
    name: "Purple",
    value: "#7C3AED",
  },
];

type ArticleEditorProps = {
  initialContent?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  stickyToolbarOffset?: number;
};

type ToolbarButtonProps = {
  label: ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

type SavedSelection = {
  from: number;
  to: number;
};

type FloatingPosition = {
  left: number;
  top: number;
};

type LinkFormMode =
  | "create"
  | "edit";

type QuoteVariant =
  | "block"
  | "pull"
  | "callout";

type TextAlignment =
  | "left"
  | "center"
  | "right"
  | "justify";

const CompassBlockquote =
  Blockquote.extend({
    addAttributes() {
      return {
        ...(this.parent?.() ?? {}),

        variant: {
          default: "block",

          parseHTML: (element) =>
            element.getAttribute(
              "data-quote-variant",
            ) || "block",

          renderHTML: (attributes) => ({
            "data-quote-variant":
              attributes.variant,
          }),
        },
      };
    },
  });

function ToolbarButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition ${
        active
          ? "bg-[#27430D] text-white"
          : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div className="mx-1 h-7 w-px shrink-0 bg-[#27430D]/10" />
  );
}

function BulletListIcon({
  size = 18,
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
      <circle
        cx="4"
        cy="6"
        r="1.5"
        fill="currentColor"
      />

      <circle
        cx="4"
        cy="12"
        r="1.5"
        fill="currentColor"
      />

      <circle
        cx="4"
        cy="18"
        r="1.5"
        fill="currentColor"
      />

      <path
        d="M9 6H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NumberedListIcon({
  size = 18,
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
      <text
        x="2"
        y="7.5"
        fill="currentColor"
        fontSize="6"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        1
      </text>

      <text
        x="2"
        y="13.5"
        fill="currentColor"
        fontSize="6"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        2
      </text>

      <text
        x="2"
        y="19.5"
        fill="currentColor"
        fontSize="6"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        3
      </text>

      <path
        d="M9 6H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 12H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M9 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QuoteMenuIcon({
  size = 19,
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
        d="M6.5 4.5H17.5C19.433 4.5 21 6.067 21 8V14C21 15.933 19.433 17.5 17.5 17.5H11L6.5 20.5V17.5C4.567 17.5 3 15.933 3 14V8C3 6.067 4.567 4.5 6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8 9.25H10.2V11.25H8.7C8.7 12.05 8.35 12.65 7.6 13.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.2 9.25H15.4V11.25H13.9C13.9 12.05 13.55 12.65 12.8 13.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlignmentIcon({
  alignment,
  size = 19,
}: {
  alignment: TextAlignment;
  size?: number;
}) {
  const lines = {
    left: [
      "M3 6H21",
      "M3 10H16",
      "M3 14H19",
      "M3 18H14",
    ],

    center: [
      "M3 6H21",
      "M6 10H18",
      "M4.5 14H19.5",
      "M7 18H17",
    ],

    right: [
      "M3 6H21",
      "M8 10H21",
      "M5 14H21",
      "M10 18H21",
    ],

    justify: [
      "M3 6H21",
      "M3 10H21",
      "M3 14H21",
      "M3 18H21",
    ],
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {lines[
        alignment
      ].map(
        (
          path,
          index,
        ) => (
          <path
            key={index}
            d={path}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ),
      )}
    </svg>
  );
}

function CheckIcon({
  size = 17,
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
        d="M5 12.5L9.5 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({
  size = 12,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeUrl(
  value: string,
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith(
      "http://",
    ) ||
    trimmed.startsWith(
      "https://",
    ) ||
    trimmed.startsWith(
      "mailto:",
    ) ||
    trimmed.startsWith(
      "tel:",
    )
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function applyQuoteVariant(
  editor: Editor,
  variant: QuoteVariant,
) {
  const isQuote =
    editor.isActive(
      "blockquote",
    );

  const currentVariant =
    editor.getAttributes(
      "blockquote",
    ).variant ||
    "block";

  if (
    isQuote &&
    currentVariant ===
      variant
  ) {
    editor
      .chain()
      .focus()
      .unsetBlockquote()
      .run();

    return;
  }

  if (isQuote) {
    editor
      .chain()
      .focus()
      .updateAttributes(
        "blockquote",
        {
          variant,
        },
      )
      .run();

    return;
  }

  editor
    .chain()
    .focus()
    .setBlockquote()
    .updateAttributes(
      "blockquote",
      {
        variant,
      },
    )
    .run();
}

function EditorToolbar({
  editor,
  uploadingImage,
  onChooseImage,
  onOpenLink,
  onRemoveLink,
  linkFormOpen,
  stickyToolbarOffset,
}: {
  editor: Editor;
  uploadingImage: boolean;
  onChooseImage: () => void;
  onOpenLink: () => void;
  onRemoveLink: () => void;
  linkFormOpen: boolean;
  stickyToolbarOffset: number;
}) {
  const toolbarRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    quoteMenuOpen,
    setQuoteMenuOpen,
  ] = useState(false);

  const [
    quoteMenuLeft,
    setQuoteMenuLeft,
  ] = useState(0);

  const [
    textColorMenuOpen,
    setTextColorMenuOpen,
  ] = useState(false);

  const [
    textColorMenuLeft,
    setTextColorMenuLeft,
  ] = useState(0);

  const [
    alignmentMenuOpen,
    setAlignmentMenuOpen,
  ] = useState(false);

  const [
    alignmentMenuLeft,
    setAlignmentMenuLeft,
  ] = useState(0);

  const state =
    useEditorState({
      editor,

      selector: ({
        editor,
      }) => {
        const isQuote =
          editor.isActive(
            "blockquote",
          );

        const paragraphAlignment =
          editor.getAttributes(
            "paragraph",
          ).textAlign;

        const headingAlignment =
          editor.getAttributes(
            "heading",
          ).textAlign;

        return {
          paragraph:
            editor.isActive(
              "paragraph",
            ),

          h1:
            editor.isActive(
              "heading",
              {
                level: 1,
              },
            ),

          h2:
            editor.isActive(
              "heading",
              {
                level: 2,
              },
            ),

          h3:
            editor.isActive(
              "heading",
              {
                level: 3,
              },
            ),

          bold:
            editor.isActive(
              "bold",
            ),

          italic:
            editor.isActive(
              "italic",
            ),

          underline:
            editor.isActive(
              "underline",
            ),

          strike:
            editor.isActive(
              "strike",
            ),

          code:
            editor.isActive(
              "code",
            ),

          link:
            editor.isActive(
              "link",
            ),

          bulletList:
            editor.isActive(
              "bulletList",
            ),

          orderedList:
            editor.isActive(
              "orderedList",
            ),

          quoteVariant:
            isQuote
              ? editor.getAttributes(
                  "blockquote",
                ).variant ||
                "block"
              : null,

          highlight:
            editor.isActive(
              "highlight",
            ),

          currentTextColor:
            editor.getAttributes(
              "textStyle",
            ).color ||
            "#523A23",

          currentHighlightColor:
            editor.getAttributes(
              "highlight",
            ).color ||
            "#F0DC78",

          currentAlignment:
            (paragraphAlignment ||
              headingAlignment ||
              "left") as TextAlignment,

          canUndo:
            editor
              .can()
              .chain()
              .focus()
              .undo()
              .run(),

          canRedo:
            editor
              .can()
              .chain()
              .focus()
              .redo()
              .run(),
        };
      },
    });

  useEffect(() => {
    if (
      !quoteMenuOpen &&
      !textColorMenuOpen &&
      !alignmentMenuOpen
    ) {
      return;
    }

    function handleOutsideClick(
      event: PointerEvent,
    ) {
      const target =
        event.target;

      if (
        !(
          target instanceof
          Node
        )
      ) {
        return;
      }

      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(
          target,
        )
      ) {
        setQuoteMenuOpen(
          false,
        );

        setTextColorMenuOpen(
          false,
        );

        setAlignmentMenuOpen(
          false,
        );
      }
    }

    document.addEventListener(
      "pointerdown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick,
      );
    };
  }, [
    quoteMenuOpen,
    textColorMenuOpen,
    alignmentMenuOpen,
  ]);

  function getToolbarMenuLeft(
    event: MouseEvent<HTMLButtonElement>,
    menuWidth: number,
  ) {
    const toolbar =
      toolbarRef.current;

    if (!toolbar) {
      return 0;
    }

    const toolbarRect =
      toolbar.getBoundingClientRect();

    const buttonRect =
      event.currentTarget.getBoundingClientRect();

    const rawLeft =
      buttonRect.left -
      toolbarRect.left +
      buttonRect.width /
        2;

    const menuHalfWidth =
      menuWidth / 2;

    return Math.min(
      Math.max(
        rawLeft,
        menuHalfWidth +
          8,
      ),
      toolbarRect.width -
        menuHalfWidth -
        8,
    );
  }

  function toggleTextColorMenu(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    setQuoteMenuOpen(
      false,
    );

    setAlignmentMenuOpen(
      false,
    );

    setTextColorMenuLeft(
      getToolbarMenuLeft(
        event,
        230,
      ),
    );

    setTextColorMenuOpen(
      (current) =>
        !current,
    );
  }

  function toggleAlignmentMenu(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    setQuoteMenuOpen(
      false,
    );

    setTextColorMenuOpen(
      false,
    );

    setAlignmentMenuLeft(
      getToolbarMenuLeft(
        event,
        210,
      ),
    );

    setAlignmentMenuOpen(
      (current) =>
        !current,
    );
  }

  function toggleQuoteMenu(
    event: MouseEvent<HTMLButtonElement>,
  ) {
    setTextColorMenuOpen(
      false,
    );

    setAlignmentMenuOpen(
      false,
    );

    setQuoteMenuLeft(
      getToolbarMenuLeft(
        event,
        220,
      ),
    );

    setQuoteMenuOpen(
      (current) =>
        !current,
    );
  }

  function chooseTextColor(
    color: string,
  ) {
    editor
      .chain()
      .focus()
      .setColor(
        color,
      )
      .run();

    setTextColorMenuOpen(
      false,
    );
  }

  function resetTextColor() {
    editor
      .chain()
      .focus()
      .unsetColor()
      .run();

    setTextColorMenuOpen(
      false,
    );
  }

  function chooseAlignment(
    alignment: TextAlignment,
  ) {
    editor
      .chain()
      .focus()
      .setTextAlign(
        alignment,
      )
      .run();

    setAlignmentMenuOpen(
      false,
    );
  }

  function chooseQuote(
    variant: QuoteVariant,
  ) {
    applyQuoteVariant(
      editor,
      variant,
    );

    setQuoteMenuOpen(
      false,
    );
  }

  return (
    <div
      ref={
        toolbarRef
      }
      style={{
        top:
          stickyToolbarOffset,
      }}
      className="
        sticky
        z-40
        overflow-visible
        rounded-t-2xl
        border-b
        border-[#27430D]/10
        bg-white/95
        shadow-sm
        backdrop-blur
      "
    >
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto px-3 py-2">
        <ToolbarButton
          label={
            <AltArrowLeftIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Undo"
          disabled={
            !state.canUndo
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .undo()
              .run()
          }
        />

        <ToolbarButton
          label={
            <AltArrowRightIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Redo"
          disabled={
            !state.canRedo
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .redo()
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label="P"
          title="Paragraph"
          active={
            state.paragraph
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setParagraph()
              .run()
          }
        />

        <ToolbarButton
          label="H1"
          title="Heading 1"
          active={
            state.h1
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHeading({
                level: 1,
              })
              .run()
          }
        />

        <ToolbarButton
          label="H2"
          title="Heading 2"
          active={
            state.h2
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHeading({
                level: 2,
              })
              .run()
          }
        />

        <ToolbarButton
          label="H3"
          title="Heading 3"
          active={
            state.h3
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHeading({
                level: 3,
              })
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label={
            <TextBoldIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Bold"
          active={
            state.bold
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
        />

        <ToolbarButton
          label={
            <TextItalicIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Italic"
          active={
            state.italic
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
        />

        <ToolbarButton
          label={
            <TextUnderlineIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Underline"
          active={
            state.underline
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleUnderline()
              .run()
          }
        />

        <ToolbarButton
          label={
            <TextCrossIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Strikethrough"
          active={
            state.strike
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
        />

        <ToolbarButton
          label={
            <CodeIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Inline code"
          active={
            state.code
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCode()
              .run()
          }
        />

        <ToolbarDivider />

        {/* Text color */}
        <button
          type="button"
          title="Text color"
          aria-label="Text color"
          onClick={
            toggleTextColorMenu
          }
          className={`relative flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2.5 transition ${
            textColorMenuOpen
              ? "bg-[#F6F1EA] text-[#27430D]"
              : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
          }`}
        >
          <TextFormatIcon
            size={19}
            strokeWidth={
              1.8
            }
            aria-hidden="true"
          />

          <span
            className="absolute bottom-1 left-2 right-2 h-0.75 rounded-full"
            style={{
              backgroundColor:
                state.currentTextColor,
            }}
          />
        </button>

        {/* Highlight */}
        <label
          title="Highlight color"
          className={`relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition ${
            state.highlight
              ? "bg-[#27430D] text-white"
              : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
          }`}
        >
          <TextSelectionIcon
            size={18}
            strokeWidth={
              1.8
            }
            aria-hidden="true"
          />

          <span
            className="absolute bottom-1 left-2 right-2 h-1 rounded-sm"
            style={{
              backgroundColor:
                state.currentHighlightColor,
            }}
          />

          <input
            type="color"
            value={
              state.currentHighlightColor
            }
            onChange={(
              event,
            ) =>
              editor
                .chain()
                .focus()
                .setHighlight({
                  color:
                    event
                      .target
                      .value,
                })
                .run()
            }
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>

        <ToolbarButton
          label={
            <EraserIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Remove highlight"
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetHighlight()
              .run()
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label={
            <LinkIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title={
            state.link
              ? "Edit link"
              : "Create link"
          }
          active={
            state.link ||
            linkFormOpen
          }
          onClick={
            onOpenLink
          }
        />

        {state.link && (
          <ToolbarButton
            label={
              <UnlinkIcon
                size={18}
                strokeWidth={
                  1.8
                }
                aria-hidden="true"
              />
            }
            title="Remove link"
            onClick={
              onRemoveLink
            }
          />
        )}

        <ToolbarButton
          label={
            uploadingImage ? (
              <RefreshIcon
                size={18}
                strokeWidth={
                  1.8
                }
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <GalleryAddIcon
                size={18}
                strokeWidth={
                  1.8
                }
                aria-hidden="true"
              />
            )
          }
          title="Insert image"
          disabled={
            uploadingImage
          }
          onClick={
            onChooseImage
          }
        />

        <ToolbarDivider />

        <ToolbarButton
          label={
            <BulletListIcon
              size={19}
            />
          }
          title="Bullet list"
          active={
            state.bulletList
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        />

        <ToolbarButton
          label={
            <NumberedListIcon
              size={19}
            />
          }
          title="Numbered list"
          active={
            state.orderedList
          }
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        />

        {/* Alignment dropdown */}
        <button
          type="button"
          title="Text alignment"
          aria-label="Text alignment"
          onClick={
            toggleAlignmentMenu
          }
          className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-2.5 transition ${
            alignmentMenuOpen
              ? "bg-[#F6F1EA] text-[#27430D]"
              : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
          }`}
        >
          <AlignmentIcon
            alignment={
              state.currentAlignment
            }
            size={19}
          />

          <ChevronDownIcon />
        </button>

        {/* Quote dropdown */}
        <button
          type="button"
          title="Quote styles"
          aria-label="Quote styles"
          onClick={
            toggleQuoteMenu
          }
          className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2.5 transition ${
            state.quoteVariant ||
            quoteMenuOpen
              ? "bg-[#27430D] text-white"
              : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
          }`}
        >
          <QuoteMenuIcon
            size={19}
          />
        </button>

        <ToolbarButton
          label={
            <MinusIcon
              size={18}
              strokeWidth={
                1.8
              }
              aria-hidden="true"
            />
          }
          title="Horizontal divider"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
        />
      </div>

      {/* Text color menu */}
      {textColorMenuOpen && (
        <div
          style={{
            left:
              textColorMenuLeft,
          }}
          className="absolute top-[calc(100%+8px)] z-50 w-57.5 -translate-x-1/2"
        >
          <div className="absolute left-1/2 -top-1.25h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[#27430D]/10 bg-white" />

          <div className="relative rounded-xl border border-[#27430D]/10 bg-white p-3 shadow-[0_8px_24px_rgba(39,67,13,0.14)]">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-[#523A23]/45">
              Text color
            </p>

            <div className="grid grid-cols-4 gap-2">
              {TEXT_COLORS.map(
                (
                  color,
                ) => (
                  <button
                    key={
                      color.value
                    }
                    type="button"
                    title={
                      color.name
                    }
                    aria-label={
                      color.name
                    }
                    onMouseDown={(
                      event,
                    ) => {
                      event.preventDefault();
                    }}
                    onClick={() =>
                      chooseTextColor(
                        color.value,
                      )
                    }
                    className={`flex h-10 w-full items-center justify-center rounded-lg border transition hover:bg-[#F6F1EA] ${
                      state.currentTextColor.toLowerCase() ===
                      color.value.toLowerCase()
                        ? "border-[#27430D] bg-[#F6F1EA]"
                        : "border-[#27430D]/10"
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{
                        backgroundColor:
                          color.value,
                      }}
                    />
                  </button>
                ),
              )}
            </div>

            <div className="mt-3 border-t border-[#27430D]/10 pt-3">
              <label className="relative flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-medium text-[#523A23] transition hover:bg-[#F6F1EA]">
                <span>
                  Custom color
                </span>

                <span
                  className="h-6 w-6 rounded-full border border-[#27430D]/15"
                  style={{
                    backgroundColor:
                      state.currentTextColor,
                  }}
                />

                <input
                  type="color"
                  value={
                    state.currentTextColor
                  }
                  onChange={(
                    event,
                  ) =>
                    editor
                      .chain()
                      .focus()
                      .setColor(
                        event
                          .target
                          .value,
                      )
                      .run()
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>

              <button
                type="button"
                onMouseDown={(
                  event,
                ) => {
                  event.preventDefault();
                }}
                onClick={
                  resetTextColor
                }
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[#523A23]/70 transition hover:bg-[#F6F1EA] hover:text-[#27430D]"
              >
                <EraserIcon
                  size={17}
                  strokeWidth={
                    1.8
                  }
                  aria-hidden="true"
                />

                Reset color
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alignment menu */}
      {alignmentMenuOpen && (
        <div
          style={{
            left:
              alignmentMenuLeft,
          }}
          className="absolute top-[calc(100%+8px)] z-50 w-52.5 -translate-x-1/2"
        >
          <div className="absolute left-1/2 -top-1.25 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[#27430D]/10 bg-white" />

          <div className="relative rounded-xl border border-[#27430D]/10 bg-white p-2 shadow-[0_8px_24px_rgba(39,67,13,0.14)]">
            {(
              [
                {
                  label:
                    "Left",
                  value:
                    "left",
                },
                {
                  label:
                    "Center",
                  value:
                    "center",
                },
                {
                  label:
                    "Right",
                  value:
                    "right",
                },
                {
                  label:
                    "Justify",
                  value:
                    "justify",
                },
              ] as {
                label: string;
                value: TextAlignment;
              }[]
            ).map(
              (
                option,
              ) => (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onMouseDown={(
                    event,
                  ) => {
                    event.preventDefault();
                  }}
                  onClick={() =>
                    chooseAlignment(
                      option.value,
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    state.currentAlignment ===
                    option.value
                      ? "bg-[#F6F1EA] text-[#27430D]"
                      : "text-[#523A23] hover:bg-[#F6F1EA]/70 hover:text-[#27430D]"
                  }`}
                >
                  <AlignmentIcon
                    alignment={
                      option.value
                    }
                    size={19}
                  />

                  <span className="flex-1 text-left">
                    {
                      option.label
                    }
                  </span>

                  {state.currentAlignment ===
                    option.value && (
                    <CheckIcon
                      size={17}
                    />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Quote menu */}
      {quoteMenuOpen && (
        <div
          style={{
            left:
              quoteMenuLeft,
          }}
          className="absolute top-[calc(100%+8px)] z-50 w-55 -translate-x-1/2"
        >
          <div className="absolute left-1/2 -top-1.25 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[#27430D]/10 bg-white" />

          <div className="relative rounded-xl border border-[#27430D]/10 bg-white p-2 shadow-[0_8px_24px_rgba(39,67,13,0.14)]">
            <button
              type="button"
              onMouseDown={(
                event,
              ) => {
                event.preventDefault();
              }}
              onClick={() =>
                chooseQuote(
                  "block",
                )
              }
              className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                state.quoteVariant ===
                "block"
                  ? "bg-[#F6F1EA] text-[#27430D]"
                  : "text-[#523A23] hover:bg-[#F6F1EA]/70 hover:text-[#27430D]"
              }`}
            >
              Block quote
            </button>

            <button
              type="button"
              onMouseDown={(
                event,
              ) => {
                event.preventDefault();
              }}
              onClick={() =>
                chooseQuote(
                  "pull",
                )
              }
              className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                state.quoteVariant ===
                "pull"
                  ? "bg-[#F6F1EA] text-[#27430D]"
                  : "text-[#523A23] hover:bg-[#F6F1EA]/70 hover:text-[#27430D]"
              }`}
            >
              Pull quote
            </button>

            <button
              type="button"
              onMouseDown={(
                event,
              ) => {
                event.preventDefault();
              }}
              onClick={() =>
                chooseQuote(
                  "callout",
                )
              }
              className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                state.quoteVariant ===
                "callout"
                  ? "bg-[#F6F1EA] text-[#27430D]"
                  : "text-[#523A23] hover:bg-[#F6F1EA]/70 hover:text-[#27430D]"
              }`}
            >
              Callout block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArticleEditor({
  initialContent = "",
  onChange,
  placeholder =
    "Start writing your article...",
  stickyToolbarOffset = 0,
}: ArticleEditorProps) {
  const imageInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const editorShellRef =
    useRef<HTMLDivElement>(
      null,
    );

  const linkTextInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const linkUrlInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const savedLinkSelection =
    useRef<SavedSelection>({
      from: 0,
      to: 0,
    });

  const [
    content,
    setContent,
  ] = useState(
    initialContent,
  );

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    imageError,
    setImageError,
  ] = useState("");

  const [
    linkFormOpen,
    setLinkFormOpen,
  ] = useState(false);

  const [
    linkPreviewOpen,
    setLinkPreviewOpen,
  ] = useState(false);

  const [
    linkFormMode,
    setLinkFormMode,
  ] =
    useState<LinkFormMode>(
      "create",
    );

  const [
    linkText,
    setLinkText,
  ] = useState("");

  const [
    linkUrl,
    setLinkUrl,
  ] = useState("");

  const [
    linkError,
    setLinkError,
  ] = useState("");

  const [
    linkPreviewUrl,
    setLinkPreviewUrl,
  ] = useState("");

  const [
    linkPreviewText,
    setLinkPreviewText,
  ] = useState("");

  const [
    linkFormPosition,
    setLinkFormPosition,
  ] =
    useState<FloatingPosition>({
      left: 200,
      top: 150,
    });

  const [
    linkPreviewPosition,
    setLinkPreviewPosition,
  ] =
    useState<FloatingPosition>({
      left: 200,
      top: 150,
    });

  function clampHorizontalPosition(
    position: number,
  ) {
    const width =
      editorShellRef.current
        ?.clientWidth ||
      600;

    const sidePadding =
      175;

    if (
      width <
      sidePadding * 2
    ) {
      return width / 2;
    }

    return Math.min(
      Math.max(
        position,
        sidePadding,
      ),
      width -
        sidePadding,
    );
  }

  function getSelectionPopupPosition(
    editor: Editor,
  ): FloatingPosition {
    const shell =
      editorShellRef.current;

    if (!shell) {
      return {
        left: 200,
        top: 150,
      };
    }

    const {
      from,
      to,
    } =
      editor.state.selection;

    const start =
      editor.view.coordsAtPos(
        from,
      );

    const end =
      editor.view.coordsAtPos(
        to,
      );

    const shellRect =
      shell.getBoundingClientRect();

    const center =
      (
        start.left +
        end.right
      ) / 2;

    return {
      left:
        clampHorizontalPosition(
          center -
            shellRect.left,
        ),

      top:
        Math.max(
          start.bottom,
          end.bottom,
        ) -
        shellRect.top +
        12,
    };
  }

  const editor =
    useEditor({
      immediatelyRender:
        false,

      extensions: [
        StarterKit.configure({
          heading: {
            levels: [
              1,
              2,
              3,
            ],
          },

          link: false,

          blockquote: false,
        }),

        CompassBlockquote,

        Link.configure({
          openOnClick:
            false,

          autolink:
            true,

          linkOnPaste:
            true,

          defaultProtocol:
            "https",

          HTMLAttributes: {
            rel:
              "noopener noreferrer nofollow",

            target:
              "_blank",
          },
        }),

        TextStyle,

        Color.configure({
          types: [
            "textStyle",
          ],
        }),

        Highlight.configure({
          multicolor:
            true,
        }),

        TextAlign.configure({
          types: [
            "heading",
            "paragraph",
          ],

          alignments: [
            "left",
            "center",
            "right",
            "justify",
          ],

          defaultAlignment:
            "left",
        }),

        Image.configure({
          inline:
            false,

          allowBase64:
            false,
        }),

        Placeholder.configure({
          placeholder,

          emptyEditorClass:
            "is-editor-empty",

          showOnlyWhenEditable:
            true,
        }),
      ],

      content:
        initialContent,

      editorProps: {
        attributes: {
          class: `${essays.className} min-h-[700px] w-full px-8 py-7 text-[18px] leading-8 text-[#523A23] outline-none`,
        },

        handleClick: (
          view,
          _position,
          event,
        ) => {
          const target =
            event.target;

          if (
            !(
              target instanceof
              Element
            )
          ) {
            return false;
          }

          const anchor =
            target.closest(
              "a",
            );

          if (!anchor) {
            setLinkPreviewOpen(
              false,
            );

            return false;
          }

          event.preventDefault();

          const shell =
            editorShellRef.current;

          if (!shell) {
            return true;
          }

          const anchorRect =
            anchor.getBoundingClientRect();

          const shellRect =
            shell.getBoundingClientRect();

          let from: number;
          let to: number;

          try {
            from =
              view.posAtDOM(
                anchor,
                0,
              );

            to =
              view.posAtDOM(
                anchor,
                anchor
                  .childNodes
                  .length,
              );
          } catch {
            return true;
          }

          savedLinkSelection.current =
            {
              from,
              to,
            };

          const href =
            anchor.getAttribute(
              "href",
            ) || "";

          const text =
            anchor.textContent ||
            "";

          setLinkPreviewUrl(
            href,
          );

          setLinkPreviewText(
            text,
          );

          setLinkPreviewPosition({
            left:
              clampHorizontalPosition(
                anchorRect.left +
                  anchorRect.width /
                    2 -
                  shellRect.left,
              ),

            top:
              anchorRect.bottom -
              shellRect.top +
              10,
          });

          setLinkFormOpen(
            false,
          );

          setLinkPreviewOpen(
            true,
          );

          return true;
        },
      },

      onUpdate: ({
        editor,
      }) => {
        const html =
          editor.getHTML();

        setContent(
          html,
        );

        onChange?.(
          html,
        );
      },
    });

  function openLinkFormFromToolbar() {
    if (!editor) {
      return;
    }

    setLinkPreviewOpen(
      false,
    );

    setLinkError("");

    if (
      editor.isActive(
        "link",
      )
    ) {
      editor
        .chain()
        .focus()
        .extendMarkRange(
          "link",
        )
        .run();
    }

    const {
      from,
      to,
    } =
      editor.state.selection;

    savedLinkSelection.current =
      {
        from,
        to,
      };

    const selectedText =
      editor.state.doc.textBetween(
        from,
        to,
        " ",
      );

    const existingUrl =
      editor.getAttributes(
        "link",
      ).href || "";

    setLinkText(
      selectedText,
    );

    setLinkUrl(
      existingUrl,
    );

    setLinkFormMode(
      existingUrl
        ? "edit"
        : "create",
    );

    setLinkFormPosition(
      getSelectionPopupPosition(
        editor,
      ),
    );

    setLinkFormOpen(
      true,
    );

    window.setTimeout(
      () => {
        if (
          selectedText
        ) {
          linkUrlInputRef.current?.focus();
        } else {
          linkTextInputRef.current?.focus();
        }
      },
      0,
    );
  }

  function changeExistingLink() {
    setLinkText(
      linkPreviewText,
    );

    setLinkUrl(
      linkPreviewUrl,
    );

    setLinkError("");

    setLinkFormMode(
      "edit",
    );

    setLinkFormPosition({
      ...linkPreviewPosition,
    });

    setLinkPreviewOpen(
      false,
    );

    setLinkFormOpen(
      true,
    );

    window.setTimeout(
      () => {
        linkUrlInputRef.current?.focus();
      },
      0,
    );
  }

  function closeLinkForm() {
    setLinkFormOpen(
      false,
    );

    setLinkError("");

    if (editor) {
      editor
        .chain()
        .focus()
        .run();
    }
  }

  function applyLink() {
    if (!editor) {
      return;
    }

    const text =
      linkText.trim();

    const href =
      normalizeUrl(
        linkUrl,
      );

    if (!text) {
      setLinkError(
        "Enter the text you want to link.",
      );

      linkTextInputRef.current?.focus();

      return;
    }

    if (!href) {
      setLinkError(
        "Enter a URL for the link.",
      );

      linkUrlInputRef.current?.focus();

      return;
    }

    const {
      from,
      to,
    } =
      savedLinkSelection.current;

    const linkMarkType =
      editor.schema.marks
        .link;

    if (!linkMarkType) {
      setLinkError(
        "The link could not be created.",
      );

      return;
    }

    const activeMarks =
      editor.state
        .storedMarks ??
      editor.state
        .selection.$from
        .marks();

    const marksWithoutLink =
      activeMarks.filter(
        (mark) =>
          mark.type.name !==
          "link",
      );

    const linkMark =
      linkMarkType.create({
        href,

        target:
          "_blank",

        rel:
          "noopener noreferrer nofollow",
      });

    const linkedText =
      editor.schema.text(
        text,
        [
          ...marksWithoutLink,
          linkMark,
        ],
      );

    const transaction =
      editor.state.tr;

    transaction.replaceWith(
      from,
      to,
      linkedText,
    );

    const cursorPosition =
      from +
      text.length;

    transaction.setSelection(
      TextSelection.create(
        transaction.doc,
        cursorPosition,
      ),
    );

    transaction.setStoredMarks(
      marksWithoutLink,
    );

    editor.view.dispatch(
      transaction,
    );

    editor.view.focus();

    setLinkFormOpen(
      false,
    );

    setLinkPreviewOpen(
      false,
    );

    setLinkError("");

    setLinkText("");

    setLinkUrl("");
  }

  function handleLinkInputKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      event.stopPropagation();

      applyLink();

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      event.stopPropagation();

      closeLinkForm();
    }
  }

  function removeSavedLink() {
    if (!editor) {
      return;
    }

    const {
      from,
      to,
    } =
      savedLinkSelection.current;

    editor
      .chain()
      .focus()
      .setTextSelection({
        from,
        to,
      })
      .unsetLink()
      .run();

    setLinkFormOpen(
      false,
    );

    setLinkPreviewOpen(
      false,
    );
  }

  function removeCurrentLink() {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange(
        "link",
      )
      .unsetLink()
      .run();

    setLinkFormOpen(
      false,
    );

    setLinkPreviewOpen(
      false,
    );
  }

  async function uploadEditorImage(
    file: File,
  ) {
    if (!editor) {
      return;
    }

    setImageError("");

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      setImageError(
        "Please choose a JPG, PNG, or WebP image.",
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setImageError(
        "Image must be 5 MB or smaller.",
      );

      return;
    }

    setUploadingImage(
      true,
    );

    try {
      const supabase =
        createClient();

      let extension =
        "jpg";

      if (
        file.type ===
        "image/png"
      ) {
        extension =
          "png";
      }

      if (
        file.type ===
        "image/webp"
      ) {
        extension =
          "webp";
      }

      const filePath =
        `content/${crypto.randomUUID()}.${extension}`;

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "article-images",
          )
          .upload(
            filePath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            },
          );

      if (
        uploadError
      ) {
        throw uploadError;
      }

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            "article-images",
          )
          .getPublicUrl(
            filePath,
          );

      if (
        !publicUrlData
          .publicUrl
      ) {
        throw new Error(
          "Unable to get image URL.",
        );
      }

      editor
        .chain()
        .focus()
        .setImage({
          src:
            publicUrlData
              .publicUrl,

          alt:
            file.name,
        })
        .run();
    } catch (
      error
    ) {
      console.error(
        "Editor image upload error:",
        error,
      );

      setImageError(
        error instanceof
          Error
          ? error.message
          : "Unable to upload image.",
      );
    } finally {
      setUploadingImage(
        false,
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }
    }
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadEditorImage(
      file,
    );
  }

  if (!editor) {
    return (
      <div className="flex min-h-125 items-center justify-center rounded-2xl border border-[#27430D]/10 bg-white text-sm text-[#523A23]/35">
        Loading editor...
      </div>
    );
  }

  return (
    <div>
      <input
        type="hidden"
        name="content"
        value={
          content
        }
      />

      <input
        ref={
          imageInputRef
        }
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={
          handleImageChange
        }
        className="hidden"
      />

      <div
        ref={
          editorShellRef
        }
        className="relative overflow-visible rounded-2xl border border-[#27430D]/10 bg-white shadow-[0_2px_10px_rgba(39,67,13,0.04)]"
      >
        <EditorToolbar
          editor={
            editor
          }
          uploadingImage={
            uploadingImage
          }
          stickyToolbarOffset={
            stickyToolbarOffset
          }
          linkFormOpen={
            linkFormOpen
          }
          onChooseImage={() =>
            imageInputRef.current?.click()
          }
          onOpenLink={
            openLinkFormFromToolbar
          }
          onRemoveLink={
            removeCurrentLink
          }
        />

        {imageError && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {imageError}
          </div>
        )}

        <EditorContent
          editor={
            editor
          }
          className="
            [&_.tiptap]:min-h-175
            [&_.tiptap]:outline-none

            [&_.tiptap_h1]:mb-5
            [&_.tiptap_h1]:mt-8
            [&_.tiptap_h1]:text-[44px]
            [&_.tiptap_h1]:font-bold
            [&_.tiptap_h1]:leading-[1.08]
            [&_.tiptap_h1]:tracking-[-0.02em]
            [&_.tiptap_h1]:text-[#27430D]

            [&_.tiptap_h2]:mb-4
            [&_.tiptap_h2]:mt-8
            [&_.tiptap_h2]:text-[36px]
            [&_.tiptap_h2]:font-bold
            [&_.tiptap_h2]:leading-[1.12]
            [&_.tiptap_h2]:tracking-[-0.015em]
            [&_.tiptap_h2]:text-[#27430D]

            [&_.tiptap_h3]:mb-3
            [&_.tiptap_h3]:mt-7
            [&_.tiptap_h3]:text-[28px]
            [&_.tiptap_h3]:font-bold
            [&_.tiptap_h3]:leading-[1.2]
            [&_.tiptap_h3]:text-[#27430D]

            [&_.tiptap_p]:my-4

            [&_.tiptap_strong]:font-bold
            [&_.tiptap_strong]:text-[#27430D]

            [&_.tiptap_em]:italic

            [&_.tiptap_u]:underline
            [&_.tiptap_u]:underline-offset-2

            [&_.tiptap_s]:line-through

            [&_.tiptap_a]:cursor-pointer
            [&_.tiptap_a]:font-medium
            [&_.tiptap_a]:text-[#687704]
            [&_.tiptap_a]:underline
            [&_.tiptap_a]:decoration-[#687704]/40
            [&_.tiptap_a]:decoration-2
            [&_.tiptap_a]:underline-offset-4
            [&_.tiptap_a:hover]:text-[#27430D]
            [&_.tiptap_a:hover]:decoration-[#27430D]

            [&_.tiptap_ul]:my-5
            [&_.tiptap_ul]:list-disc
            [&_.tiptap_ul]:space-y-2
            [&_.tiptap_ul]:pl-7

            [&_.tiptap_ol]:my-5
            [&_.tiptap_ol]:list-decimal
            [&_.tiptap_ol]:space-y-2
            [&_.tiptap_ol]:pl-7

            [&_.tiptap_li]:pl-1

            [&_.tiptap_code]:rounded
            [&_.tiptap_code]:bg-[#F6F1EA]
            [&_.tiptap_code]:px-1.5
            [&_.tiptap_code]:py-0.5
            [&_.tiptap_code]:font-mono
            [&_.tiptap_code]:text-sm
            [&_.tiptap_code]:text-[#27430D]

            [&_.tiptap_img]:my-7
            [&_.tiptap_img]:max-h-150
            [&_.tiptap_img]:w-full
            [&_.tiptap_img]:rounded-xl
            [&_.tiptap_img]:object-contain

            [&_.tiptap_hr]:my-8
            [&_.tiptap_hr]:border-[#27430D]/15

            [&_.tiptap_mark]:rounded
            [&_.tiptap_mark]:px-0.5
          "
        />

        {linkFormOpen && (
          <div
            style={{
              left:
                linkFormPosition.left,

              top:
                linkFormPosition.top,
            }}
            className="absolute z-50 w-77.5 max-w-[calc(100%-24px)] -translate-x-1/2"
          >
            <div className="absolute left-1/2 -top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-[#27430D]/10 bg-white" />

            <div className="relative rounded-2xl border border-[#27430D]/10 bg-white p-5 shadow-[0_10px_30px_rgba(39,67,13,0.16)]">
              <p className="mb-4 text-sm font-semibold text-[#27430D]">
                {linkFormMode ===
                "edit"
                  ? "Edit link"
                  : "Create a link"}
              </p>

              <div className="space-y-3">
                <input
                  ref={
                    linkTextInputRef
                  }
                  type="text"
                  value={
                    linkText
                  }
                  onChange={(
                    event,
                  ) => {
                    setLinkText(
                      event.target
                        .value,
                    );

                    setLinkError(
                      "",
                    );
                  }}
                  onKeyDown={
                    handleLinkInputKeyDown
                  }
                  placeholder="Enter text..."
                  className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/10"
                />

                <input
                  ref={
                    linkUrlInputRef
                  }
                  type="text"
                  value={
                    linkUrl
                  }
                  onChange={(
                    event,
                  ) => {
                    setLinkUrl(
                      event.target
                        .value,
                    );

                    setLinkError(
                      "",
                    );
                  }}
                  onKeyDown={
                    handleLinkInputKeyDown
                  }
                  placeholder="Enter URL..."
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/10"
                />
              </div>

              {linkError && (
                <p className="mt-3 text-xs font-medium text-red-600">
                  {
                    linkError
                  }
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    applyLink
                  }
                  className="rounded-xl bg-[#27430D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#687704]"
                >
                  {linkFormMode ===
                  "edit"
                    ? "Save"
                    : "Link"}
                </button>

                <button
                  type="button"
                  onClick={
                    closeLinkForm
                  }
                  className="rounded-xl bg-[#F6F1EA] px-4 py-2.5 text-sm font-semibold text-[#523A23] transition hover:bg-[#27430D]/10 hover:text-[#27430D]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {linkPreviewOpen && (
          <div
            style={{
              left:
                linkPreviewPosition.left,

              top:
                linkPreviewPosition.top,
            }}
            className="absolute z-50 max-w-[calc(100%-24px)] -translate-x-1/2"
          >
            <div className="absolute left-1/2 -top-1.25 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-[#27430D]/10 bg-white" />

            <div className="relative flex max-w-105 items-center gap-1 whitespace-nowrap rounded-xl border border-[#27430D]/10 bg-white px-3 py-2.5 text-sm shadow-[0_8px_24px_rgba(39,67,13,0.14)]">
              <a
                href={
                  linkPreviewUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-55 truncate font-medium text-[#687704] underline underline-offset-2 transition hover:text-[#27430D]"
              >
                {
                  linkPreviewUrl
                }
              </a>

              <span className="text-[#523A23]/30">
                —
              </span>

              <button
                type="button"
                onClick={
                  changeExistingLink
                }
                className="font-semibold text-[#687704] underline underline-offset-2 transition hover:text-[#27430D]"
              >
                Change
              </button>

              <span className="text-[#523A23]/25">
                |
              </span>

              <button
                type="button"
                onClick={
                  removeSavedLink
                }
                className="font-semibold text-[#687704] underline underline-offset-2 transition hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#523A23]/35">
        <span>
          Formatting appears directly in the editor as you write.
        </span>

        <span>
          Editor ready
        </span>
      </div>

      <style jsx global>{`
        .tiptap.is-editor-empty
          p:first-child::before {
          color: rgba(
            82,
            58,
            35,
            0.3
          );
          content: attr(
            data-placeholder
          );
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap.ProseMirror-focused.is-editor-empty
          p:first-child::before {
          content: "";
        }

        .tiptap
          blockquote[data-quote-variant="block"] {
          margin: 1.5rem 0;
          border-left: 5px solid
            #687704;
          padding: 0.25rem
            0 0.25rem
            1.25rem;
          color: #523a23;
        }

        .tiptap
          blockquote[data-quote-variant="block"]
          p {
          margin-top: 0;
          margin-bottom: 0;
        }

        .tiptap
          blockquote[data-quote-variant="pull"] {
          margin: 2.75rem auto;
          width: 92%;
          border-top: 1px solid
            rgba(
              39,
              67,
              13,
              0.16
            );
          border-bottom: 1px solid
            rgba(
              39,
              67,
              13,
              0.16
            );
          padding: 2rem;
          color: #27430d;
          font-size: 1.65rem;
          font-style: italic;
          line-height: 1.4;
          text-align: center;
        }

        .tiptap
          blockquote[data-quote-variant="pull"]
          p {
          margin: 0;
        }

        .tiptap
          blockquote[data-quote-variant="callout"] {
          margin: 1.75rem 0;
          border: 1px solid
            rgba(
              39,
              67,
              13,
              0.08
            );
          border-radius: 0.85rem;
          background: #f6f1ea;
          padding: 1.4rem
            1.6rem;
          color: #523a23;
          font-style: normal;
        }

        .tiptap
          blockquote[data-quote-variant="callout"]
          p:first-child {
          margin-top: 0;
        }

        .tiptap
          blockquote[data-quote-variant="callout"]
          p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}