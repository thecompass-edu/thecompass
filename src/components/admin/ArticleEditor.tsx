"use client";

import {
  ChangeEvent,
  ComponentType,
  ReactNode,
  useRef,
  useState,
} from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import * as SolarIcons from "@solar-icons/react/linear";

import { createClient } from "@/lib/supabase/client";

type ArticleEditorProps = {
  initialContent?: string;
  stickyToolbarOffset?: number;
};

type ToolbarButtonProps = {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

type SolarIconProps = {
  size?: string | number;
  strokeWidth?: string | number;
  className?: string;
  "aria-hidden"?: boolean;
};

type SolarIconComponent = ComponentType<SolarIconProps>;

const availableSolarIcons = SolarIcons as unknown as Record<
  string,
  SolarIconComponent | undefined
>;

// This fallback already exists in the Solar package used elsewhere in the admin.
const FallbackIcon =
  availableSolarIcons.SidebarMinimalisticIcon ??
  (() => null);

// Some Solar versions use slightly different names.
// This lets the editor use the best matching icon without breaking the build.
function getSolarIcon(...names: string[]) {
  for (const name of names) {
    const icon = availableSolarIcons[name];

    if (icon) {
      return icon;
    }
  }

  return FallbackIcon;
}

const UndoIcon = getSolarIcon(
  "UndoLeftRoundIcon",
  "UndoLeftIcon",
  "AltArrowLeftIcon",
  "ArrowLeftIcon",
);

const RedoIcon = getSolarIcon(
  "UndoRightRoundIcon",
  "UndoRightIcon",
  "AltArrowRightIcon",
  "ArrowRightIcon",
);

const BoldIcon = getSolarIcon(
  "TextBoldIcon",
  "BoldIcon",
);

const ItalicIcon = getSolarIcon(
  "TextItalicIcon",
  "ItalicIcon",
);

const UnderlineIcon = getSolarIcon(
  "TextUnderlineIcon",
  "UnderlineIcon",
);

const StrikeIcon = getSolarIcon(
  "TextCrossIcon",
  "TextCrossedIcon",
  "StrikeIcon",
);

const CodeIcon = getSolarIcon(
  "CodeIcon",
  "CodeSquareIcon",
);

const BulletListIcon = getSolarIcon(
  "ListIcon",
  "ListCheckIcon",
  "ListArrowDownMinimalisticIcon",
);

const OrderedListIcon = getSolarIcon(
  "ListArrowDownMinimalisticIcon",
  "ListDownMinimalisticIcon",
  "ListIcon",
);

const QuoteIcon = getSolarIcon(
  "QuoteUpIcon",
  "QuoteDownIcon",
);

const LinkIcon = getSolarIcon(
  "LinkIcon",
  "LinkMinimalisticIcon",
);

const UnlinkIcon = getSolarIcon(
  "LinkBrokenIcon",
  "LinkBrokenMinimalisticIcon",
);

const ImageIcon = getSolarIcon(
  "GalleryAddIcon",
  "GalleryIcon",
  "GalleryWideIcon",
  "UploadIcon",
  "ExportIcon",
);

const HorizontalRuleIcon = getSolarIcon(
  "MinusIcon",
  "MinusCircleIcon",
);

const ClearFormattingIcon = getSolarIcon(
  "EraserIcon",
  "EraserSquareIcon",
);

function ToolbarButton({
  title,
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg px-2 text-sm transition",
        active
          ? "bg-[#27430D] text-white"
          : "text-[#523A23]/70 hover:bg-[#687704]/5 hover:text-[#27430D]",
        disabled
          ? "cursor-not-allowed opacity-35"
          : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div className="mx-1 h-6 w-px shrink-0 bg-[#27430D]/10" />
  );
}

export default function ArticleEditor({
  initialContent = "",
  stickyToolbarOffset = 0,
}: ArticleEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [, setToolbarVersion] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      ImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class:
            "my-6 h-auto max-h-[600px] w-full rounded-xl object-contain",
        },
      }),

      Placeholder.configure({
        placeholder: "Start writing your article...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],

    content: initialContent,

    editorProps: {
      attributes: {
        class:
          "min-h-[650px] w-full px-6 py-6 text-base leading-8 text-[#523A23] outline-none sm:px-8 sm:py-7",
      },
    },

    // The HTML is kept here so it can be submitted with the rest of the form.
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      setToolbarVersion((version) => version + 1);
    },

    // This refreshes active toolbar states when the cursor moves.
    onSelectionUpdate: () => {
      setToolbarVersion((version) => version + 1);
    },
  });

  // Opens the hidden file input when the image toolbar button is clicked.
  function openImagePicker() {
    imageInputRef.current?.click();
  }

  // Uploads an article-body image to Supabase and inserts it at the cursor.
  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !editor) {
      return;
    }

    setImageError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError(
        "Please choose a JPG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    const maxImageSize = 5 * 1024 * 1024;

    if (file.size > maxImageSize) {
      setImageError(
        "Article images must be 5 MB or smaller.",
      );

      event.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const supabase = createClient();

      let extension = "jpg";

      if (file.type === "image/png") {
        extension = "png";
      }

      if (file.type === "image/webp") {
        extension = "webp";
      }

      const filePath =
        `content/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("article-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error(
          "The image was uploaded but its URL could not be created.",
        );
      }

      // The uploaded image is inserted exactly where the cursor is.
      editor
        .chain()
        .focus()
        .setImage({
          src: data.publicUrl,
          alt: file.name,
        })
        .run();
    } catch (error) {
      console.error(
        "Article image upload failed:",
        error,
      );

      setImageError(
        error instanceof Error
          ? error.message
          : "The image could not be uploaded.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  // Adds a link to the selected text or updates an existing link.
  function handleAddLink() {
    if (!editor) {
      return;
    }

    const currentUrl =
      editor.getAttributes("link").href ?? "";

    const enteredUrl = window.prompt(
      "Enter the link URL",
      currentUrl,
    );

    if (enteredUrl === null) {
      return;
    }

    const trimmedUrl = enteredUrl.trim();

    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .unsetLink()
        .run();

      return;
    }

    const hasProtocol =
      /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(
        trimmedUrl,
      );

    const url = hasProtocol
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: "_blank",
        rel: "noopener noreferrer",
      })
      .run();
  }

  if (!editor) {
    return (
      <div className="min-h-[650px] rounded-2xl border border-[#27430D]/10 bg-white" />
    );
  }

  return (
    <div>
      {/* The editor content is submitted through this hidden input. */}
      <input
        type="hidden"
        name="content"
        value={content}
      />

      {/* The real image input stays hidden because the toolbar opens it. */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="rounded-2xl border border-[#27430D]/10 bg-white shadow-[0_2px_10px_rgba(39,67,13,0.04)]">
        {/* The toolbar stays visible while the article body scrolls. */}
        <div
          style={{
            top: stickyToolbarOffset,
          }}
          className="sticky z-30 flex flex-nowrap items-center gap-1 overflow-x-auto rounded-t-2xl border-b border-[#27430D]/10 bg-white/95 px-3 py-2 shadow-sm backdrop-blur"
        >
          <ToolbarButton
            title="Undo"
            onClick={() =>
              editor
                .chain()
                .focus()
                .undo()
                .run()
            }
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .undo()
                .run()
            }
          >
            <UndoIcon
              size={19}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Redo"
            onClick={() =>
              editor
                .chain()
                .focus()
                .redo()
                .run()
            }
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .redo()
                .run()
            }
          >
            <RedoIcon
              size={19}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Paragraph"
            active={editor.isActive("paragraph")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setParagraph()
                .run()
            }
          >
            <span className="text-base font-semibold">
              P
            </span>
          </ToolbarButton>

          <ToolbarButton
            title="Heading 1"
            active={editor.isActive("heading", {
              level: 1,
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 1,
                })
                .run()
            }
          >
            <span className="font-semibold">
              H1
            </span>
          </ToolbarButton>

          <ToolbarButton
            title="Heading 2"
            active={editor.isActive("heading", {
              level: 2,
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
          >
            <span className="font-semibold">
              H2
            </span>
          </ToolbarButton>

          <ToolbarButton
            title="Heading 3"
            active={editor.isActive("heading", {
              level: 3,
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 3,
                })
                .run()
            }
          >
            <span className="font-semibold">
              H3
            </span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            <BoldIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            <ItalicIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleUnderline()
                .run()
            }
          >
            <UnderlineIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
          >
            <StrikeIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Inline code"
            active={editor.isActive("code")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleCode()
                .run()
            }
          >
            <CodeIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Clear formatting"
            onClick={() =>
              editor
                .chain()
                .focus()
                .unsetAllMarks()
                .clearNodes()
                .run()
            }
          >
            <ClearFormattingIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          >
            <BulletListIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          >
            <OrderedListIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Blockquote"
            active={editor.isActive("blockquote")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
          >
            <QuoteIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Add link"
            active={editor.isActive("link")}
            onClick={handleAddLink}
          >
            <LinkIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarButton
            title="Remove link"
            disabled={!editor.isActive("link")}
            onClick={() =>
              editor
                .chain()
                .focus()
                .unsetLink()
                .run()
            }
          >
            <UnlinkIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title={
              uploadingImage
                ? "Uploading image"
                : "Insert image"
            }
            disabled={uploadingImage}
            onClick={openImagePicker}
          >
            <ImageIcon
              size={21}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            title="Horizontal line"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run()
            }
          >
            <HorizontalRuleIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden
            />
          </ToolbarButton>
        </div>

        {/* This is the area where the admin writes the article. */}
        <EditorContent editor={editor} />
      </div>

      {uploadingImage && (
        <p className="mt-2 text-xs font-medium text-[#687704]">
          Uploading image...
        </p>
      )}

      {imageError && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {imageError}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#523A23]/35">
        <span>
          Use the toolbar to format your article.
        </span>

        <span>
          Editor ready
        </span>
      </div>
    </div>
  );
}