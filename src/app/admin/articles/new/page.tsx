"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import ArticleEditor from "@/components/admin/ArticleEditor";
import AuthorsInput from "@/components/admin/AuthorsInput";
import CoverImageUpload from "@/components/admin/CoverImageUpload";

import { createArticle } from "./actions";

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// The icon points up when the details are visible.
// It rotates down when the details are collapsed.
function DetailsCollapseIcon({
  size = 22,
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
        d="M7 5H17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M6.5 15L12 9.5L17.5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NewArticlePage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  // The slug follows the title until the admin manually changes it.
  function handleTitleChange(value: string) {
    const previousGeneratedSlug = generateSlug(title);

    setTitle(value);

    if (!slug || slug === previousGeneratedSlug) {
      setSlug(generateSlug(value));
    }
  }

  // Manual slug edits are cleaned into URL-friendly text.
  function handleSlugChange(value: string) {
    setSlug(generateSlug(value));
  }

  return (
    <div className="min-h-screen bg-white text-[#27430D]">
      <form action={createArticle}>
        {/* The main header stays visible while the admin writes the article. */}
        <header className="sticky top-0 z-50 border-b border-[#27430D]/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-19 flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Link
                href="/admin/articles"
                className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#523A23]/65 transition hover:text-[#27430D]"
              >
                <span>←</span>
                <span>Articles</span>
              </Link>

              <div className="hidden h-7 w-px bg-[#27430D]/10 sm:block" />

              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(event) =>
                  handleTitleChange(event.target.value)
                }
                placeholder="Untitled article"
                aria-label="Article title"
                className="min-w-0 flex-1 border-none bg-transparent text-xl font-semibold tracking-tight text-[#27430D] outline-none placeholder:text-[#523A23]/30 sm:text-2xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#27430D]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#523A23]/65">
                <span className="h-1.5 w-1.5 rounded-full bg-[#687704]" />
                Draft
              </div>

              <span className="hidden text-sm text-[#523A23]/35 sm:inline">
                Not saved yet
              </span>

              <button
                type="submit"
                name="status"
                value="draft"
                className="rounded-xl border border-[#27430D]/20 bg-white px-5 py-3 text-sm font-semibold text-[#27430D] transition hover:border-[#687704]/50 hover:bg-[#687704]/5"
              >
                Save Draft
              </button>

              <button
                type="submit"
                name="status"
                value="published"
                className="rounded-xl bg-[#27430D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#687704]"
              >
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* Errors from the server action are shown directly below the header. */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Checked means the Article Details section is visible. */}
        <input
          id="article-details-toggle"
          type="checkbox"
          defaultChecked
          className="peer sr-only"
        />

        {/* This bar remains below the main header while scrolling. */}
        <label
          htmlFor="article-details-toggle"
          className="
            sticky top-19 z-40
            flex min-h-14 cursor-pointer
            items-center justify-between gap-4
            border-b border-[#27430D]/10
            bg-white/95 px-5
            backdrop-blur
            peer-checked:[&_.details-collapse-icon]:rotate-0
          "
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold text-[#27430D] sm:text-base">
              Article details
            </h2>

            <p className="text-xs text-[#523A23]/40 sm:text-sm">
              slug · excerpt · authors · category · cover image
            </p>
          </div>

          <span
            title="Show or hide article details"
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-[#687704]
              transition-colors duration-200
              hover:bg-[#F6F1EA]
              hover:text-[#27430D]
            "
          >
            {/*
              Hidden state starts rotated downward.
              When the checkbox is checked, it smoothly rotates upward.
            */}
            <span
              className="
                details-collapse-icon
                flex rotate-180
                items-center justify-center
                transition-transform
                duration-300
                ease-in-out
              "
            >
              <DetailsCollapseIcon size={22} />
            </span>
          </span>
        </label>

        {/* Everything in this section is hidden when Article Details is collapsed. */}
        <section className="hidden border-b border-[#27430D]/10 bg-white peer-checked:block">
          <div className="px-5 py-6">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              {/* Slug and excerpt */}
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="slug"
                      className="text-sm font-semibold text-[#27430D]"
                    >
                      Slug
                    </label>

                    <span className="text-xs text-[#523A23]/35">
                      Auto-generated
                    </span>
                  </div>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                      handleSlugChange(event.target.value)
                    }
                    placeholder="article-slug"
                    className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 font-mono text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/25 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                  />

                  <p className="mt-2 text-xs text-[#523A23]/35">
                    Public URL:{" "}
                    <span className="font-mono text-[#27430D]/55">
                      /articles/{slug || "article-slug"}
                    </span>
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="excerpt"
                        className="text-sm font-semibold text-[#27430D]"
                      >
                        Excerpt
                      </label>

                      <span className="text-xs text-[#523A23]/35">
                        Optional
                      </span>
                    </div>

                    <span className="text-xs text-[#523A23]/35">
                      160 recommended
                    </span>
                  </div>

                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={6}
                    maxLength={160}
                    placeholder="One or two sentences summarising the article."
                    className="w-full resize-y rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm leading-6 text-[#523A23] outline-none transition placeholder:text-[#523A23]/25 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                  />

                  <p className="mt-2 text-sm text-[#523A23]/40">
                    Shown on the article list and at the top of the article.
                  </p>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <CoverImageUpload required />

                <p className="mt-2 text-sm text-[#523A23]/40">
                  Used on the article list and at the top of the published
                  article.
                </p>
              </div>
            </div>

            {/* Author and category information */}
            <div className="mt-8 rounded-xl border border-[#27430D]/10 bg-white p-5">
              <div>
                <h3 className="text-sm font-semibold text-[#27430D]">
                  Article information
                </h3>

                <p className="mt-1 text-sm text-[#523A23]/40">
                  Add everyone who wrote the article and choose its category.
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Authors */}
                <div className="px-3">
                  <AuthorsInput />
                </div>

                {/* Category */}
                <div className="border-t border-[#27430D]/10 px-3 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="category"
                      className="text-sm font-semibold text-[#27430D]"
                    >
                      Category
                    </label>

                    <span className="text-xs text-[#523A23]/35">
                      Optional
                    </span>
                  </div>

                  <div className="mt-3">
                    <input
                      id="category"
                      name="category"
                      type="text"
                      placeholder="e.g. Financial Literacy"
                      className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3.5 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#523A23]/35">
                    Used to group related articles across The Compass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* This label scrolls normally. */}
        <section className="bg-white px-5 pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-[#27430D]">
                Article content{" "}
                <span
                  aria-hidden="true"
                  className="text-red-500"
                >
                  *
                </span>
              </label>

              <span className="text-xs text-[#523A23]/35">
                Required to save or publish
              </span>
            </div>
          </div>
        </section>

        {/* Only the editor toolbar remains sticky while the article is being written. */}
        <section className="bg-white px-5 pb-8">
          <div className="mx-auto max-w-6xl">
            <ArticleEditor stickyToolbarOffset={132} />
          </div>
        </section>
      </form>
    </div>
  );
}