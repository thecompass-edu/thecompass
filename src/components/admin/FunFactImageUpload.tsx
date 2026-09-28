"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import { createClient } from "@/lib/supabase/client";

const STORAGE_BUCKET = "fun-facts";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type FunFactImageUploadProps = {
  initialImageUrl?: string;
  onImageChange?: (url: string) => void;
  onUploadingChange?: (
    uploading: boolean,
  ) => void;
};

function getImageExtension(file: File) {
  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function validateImage(file: File) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(file.type)
  ) {
    return "Please choose a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Fun Fact image must be 5 MB or smaller.";
  }

  return null;
}

export default function FunFactImageUpload({
  initialImageUrl = "",
  onImageChange,
  onUploadingChange,
}: FunFactImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] =
    useState(initialImageUrl);

  const [fileName, setFileName] =
    useState("");

  const [
    uploadedImagePath,
    setUploadedImagePath,
  ] = useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  function updateImageUrl(url: string) {
    setImageUrl(url);
    onImageChange?.(url);
  }

  function updateUploading(
    value: boolean,
  ) {
    setUploading(value);
    onUploadingChange?.(value);
  }

  async function uploadImage(
    file: File,
  ) {
    setError("");

    const validationError =
      validateImage(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    updateUploading(true);

    try {
      const supabase =
        createClient();

      const extension =
        getImageExtension(file);

      const filePath =
        `stories/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);

        throw new Error(
          "Unable to get the uploaded image URL.",
        );
      }

      // Clean up temporary image.
      if (uploadedImagePath) {
        const {
          error: removeOldError,
        } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([
            uploadedImagePath,
          ]);

        if (removeOldError) {
          console.error(
            "FUN FACT TEMP IMAGE CLEANUP ERROR:",
            removeOldError,
          );
        }
      }

      setUploadedImagePath(
        filePath,
      );

      setFileName(file.name);

      updateImageUrl(
        publicUrlData.publicUrl,
      );
    } catch (uploadError) {
      console.error(
        "FUN FACT IMAGE UPLOAD ERROR:",
        uploadError,
      );

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload Fun Fact image.",
      );
    } finally {
      updateUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file);
  }

  async function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);

    if (uploading) {
      return;
    }

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file);
  }

  async function handleRemove() {
    setError("");

    // Delete temporary upload.
    if (uploadedImagePath) {
      try {
        const supabase =
          createClient();

        const {
          error: removeError,
        } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([
            uploadedImagePath,
          ]);

        if (removeError) {
          throw removeError;
        }
      } catch (removeError) {
        console.error(
          "FUN FACT IMAGE DELETE ERROR:",
          removeError,
        );

        setError(
          "Image was removed from the form, but Storage cleanup failed.",
        );
      }
    }

    setUploadedImagePath(null);
    setFileName("");

    updateImageUrl("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        type="hidden"
        name="image_url"
        value={imageUrl}
      />

      <input
        type="hidden"
        name="image_uploading"
        value={
          uploading
            ? "true"
            : "false"
        }
      />

      <label className="block text-[15px] font-semibold text-slate-900">
        Fun Fact Image
      </label>

      <p className="mt-1 text-sm text-[#8EA0C0]">
        JPG, PNG, or WebP. Maximum 5 MB. A
        vertical 9:16 image is recommended.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {!imageUrl ? (
        <div
          onClick={() =>
            inputRef.current?.click()
          }
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`mt-5 flex min-h-62.5 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
            isDragging
              ? "border-[#687704] bg-[#F7FAF3]"
              : "border-[#D8E0EC] bg-[#FBFCFE] hover:border-[#B4C1D3]"
          }`}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#94A6C4]"
            aria-hidden="true"
          >
            <path
              d="M12 16V4M12 4L7.5 8.5M12 4L16.5 8.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M5 14V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-4 font-semibold text-slate-900">
            {uploading
              ? "Uploading..."
              : "Upload photo"}
          </p>

          <p className="mt-1 text-sm text-[#8EA0C0]">
            Choose an image from your device
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#D8E0EC] bg-white">
          <div className="relative h-70 bg-[#F5F7FA]">
            <Image
              src={imageUrl}
              alt="Fun Fact preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">
                  Uploading...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {fileName ||
                  "Current Fun Fact image"}
              </p>

              <p className="mt-1 text-xs text-[#8EA0C0]">
                {fileName
                  ? "Uploaded to Supabase Storage"
                  : "Existing image"}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() =>
                  inputRef.current?.click()
                }
                className="rounded-lg border border-[#D8E0EC] px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Replace
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={handleRemove}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}