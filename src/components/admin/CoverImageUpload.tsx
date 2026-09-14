"use client";

import Image from "next/image";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type CoverImageUploadProps = {
  currentImageUrl?: string | null;
  required?: boolean;
};

export default function CoverImageUpload({
  currentImageUrl = null,
  required = false,
}: CoverImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl,
  );

  const [removeExisting, setRemoveExisting] =
    useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Remove temporary browser preview URLs when they are no longer needed.
  // This prevents unused image previews from staying in memory.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Create a temporary preview whenever the admin selects a new image.
  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Remove the previous temporary preview before creating a new one.
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
    setRemoveExisting(false);
  }

  // Clear the selected image and tell the server action
  // that an existing cover image should be removed.
  function handleRemove() {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setRemoveExisting(true);

    // Clear the file input so the same image can be selected again.
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      {/* The cover image label is kept inside this component
          so New Article and Edit Article use the same layout. */}
      <div className="mb-2 flex items-center gap-1">
        <label
          htmlFor="cover_image"
          className="text-sm font-semibold text-[#27430D]"
        >
          Cover image
        </label>

        {required && (
          <span
            aria-hidden="true"
            className="text-sm font-semibold text-red-500"
          >
            *
          </span>
        )}
      </div>

      {/* These hidden values help the Edit Article action determine
          whether the current cover should be kept or removed. */}
      <input
        type="hidden"
        name="current_cover_image_url"
        value={currentImageUrl ?? ""}
      />

      <input
        type="hidden"
        name="remove_cover_image"
        value={removeExisting ? "true" : "false"}
      />

      {preview ? (
        <div className="overflow-hidden rounded-xl border border-[#27430D]/15 bg-white">
          {/* Show the current or newly selected cover image. */}
          <div className="relative aspect-[16/9] w-full bg-white">
            <Image
              src={preview}
              alt="Article cover preview"
              fill
              unoptimized={preview.startsWith("blob:")}
              className="object-cover"
            />
          </div>

          {/* Give the admin controls for replacing or removing the image. */}
          <div className="flex items-center justify-between gap-3 border-t border-[#27430D]/10 bg-white p-3">
            <label
              htmlFor="cover_image"
              className="cursor-pointer text-sm font-semibold text-[#27430D] transition hover:text-[#687704]"
            >
              Change image
            </label>

            <button
              type="button"
              onClick={handleRemove}
              className="text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /*
         * The entire upload area acts as the file picker.
         * Clicking anywhere inside it opens the browser file selector.
         */
        <label
          htmlFor="cover_image"
          className="flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#27430D]/20 bg-white px-6 py-8 text-center transition hover:border-[#687704]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#27430D]/10 bg-white text-[#687704]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M12 16V4M12 4L8 8M12 4L16 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M5 15V19H19V15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mt-4 text-sm font-semibold text-[#27430D]">
            Upload cover image
          </p>

          <p className="mt-1 text-xs text-[#523A23]/40">
            JPG, PNG or WEBP
          </p>
        </label>
      )}

      {/* The real file input stays hidden because the styled upload
          area above is used as the visible file picker. */}
      <input
        ref={inputRef}
        id="cover_image"
        name="cover_image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required && !preview}
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}