import Link from "next/link";

import ArticleEditor from "@/components/admin/ArticleEditor";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import EditArticleActions from "@/components/admin/EditArticleActions";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";
import { createClient } from "@/lib/supabase/server";

import { updateArticle } from "./actions";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function RequiredMark() {
  return (
    <span
      aria-hidden="true"
      className="text-red-500"
    >
      *
    </span>
  );
}

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

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: article,
    error: fetchError,
  } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error(
      "ARTICLE FETCH ERROR:",
      fetchError,
    );

    return (
      <div className="min-h-screen bg-white px-6 py-8 text-[#27430D] sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/admin/articles"
          className="text-sm font-semibold text-[#687704] transition hover:text-[#27430D]"
        >
          ← Back to Articles
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-bold text-red-700">
            Could not load article
          </h1>

          <p className="mt-2 text-sm text-[#523A23]/60">
            Something went wrong while trying to load this article.
          </p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white px-6 py-8 text-[#27430D] sm:px-8 lg:px-10 lg:py-10">
        <Link
          href="/admin/articles"
          className="text-sm font-semibold text-[#687704] transition hover:text-[#27430D]"
        >
          ← Back to Articles
        </Link>

        <div className="mt-8 rounded-2xl border border-[#27430D]/10 bg-white p-8">
          <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
            ARTICLE
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#27430D]">
            Article not found
          </h1>

          <p className="mt-3 text-sm text-[#523A23]/60">
            The article may have been deleted or the link may no longer be
            valid.
          </p>

          <p className="mt-4 break-all text-xs text-[#523A23]/40">
            Article ID: {id}
          </p>

          <Link
            href="/admin/articles"
            className="mt-6 inline-flex rounded-xl bg-[#27430D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#687704]"
          >
            Return to Articles
          </Link>
        </div>
      </div>
    );
  }

  const updateArticleWithId =
    updateArticle.bind(
      null,
      article.id,
    );

  const currentStatus =
    article.status === "published"
      ? "Published"
      : "Draft";

  const primaryAuthor =
    Array.isArray(article.authors) &&
    article.authors.length > 0
      ? String(article.authors[0])
      : article.author_name ?? "";

  return (
    <div className="min-h-screen bg-white text-[#27430D]">
      <form
        action={
          updateArticleWithId
        }
      >
        <UnsavedChangesGuard />
        {/* Keep values that are not edited directly here. */}
        <input
          type="hidden"
          name="slug"
          value={
            article.slug ?? ""
          }
        />

        <input
          type="hidden"
          name="is_featured"
          value={
            article.is_featured
              ? "on"
              : ""
          }
        />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-[#27430D]/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-19 flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/articles"
              className="flex shrink-0 items-center gap-2 text-sm font-medium text-[#523A23]/65 transition hover:text-[#27430D]"
            >
              <span>←</span>

              <span>
                Articles
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#27430D]/10 bg-white px-3 py-1.5 text-xs font-medium text-[#523A23]/65">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    article.status ===
                    "published"
                      ? "bg-[#27430D]"
                      : "bg-[#687704]"
                  }`}
                />

                {currentStatus}
              </div>

              <span className="hidden text-sm text-[#523A23]/35 sm:inline">
                Saved
              </span>

              <EditArticleActions
                articleTitle={
                  article.title
                }
                currentStatus={
                  article.status ===
                  "published"
                    ? "published"
                    : "draft"
                }
              />
            </div>
          </div>
        </header>

        {/* Article details toggle */}
        <input
          id="article-details-toggle"
          type="checkbox"
          defaultChecked
          className="peer sr-only"
        />

        {/* Article details header */}
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
              title · excerpt ·
              author · category ·
              cover image
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
              <DetailsCollapseIcon
                size={22}
              />
            </span>
          </span>
        </label>

        {/* Article details */}
        <section className="hidden border-b border-[#27430D]/10 bg-white peer-checked:block">
          <div className="px-5 py-6">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              {/* Title and excerpt */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="text-sm font-semibold text-[#27430D]"
                  >
                    Title{" "}
                    <RequiredMark />
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    autoFocus
                    defaultValue={
                      article.title
                    }
                    placeholder="Enter article title"
                    className="mt-3 w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3.5 text-base font-medium text-[#27430D] outline-none transition placeholder:font-normal placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                  />

                  <p className="mt-2 text-xs text-[#523A23]/35">
                    The article URL is
                    managed automatically.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="excerpt"
                      className="text-sm font-semibold text-[#27430D]"
                    >
                      Excerpt{" "}
                      <RequiredMark />
                    </label>

                    <span className="text-xs text-[#523A23]/35">
                      Maximum 160
                      characters
                    </span>
                  </div>

                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={6}
                    maxLength={160}
                    required
                    defaultValue={
                      article.excerpt ??
                      ""
                    }
                    placeholder="One or two sentences summarising the article."
                    className="w-full resize-y rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm leading-6 text-[#523A23] outline-none transition placeholder:text-[#523A23]/25 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                  />

                  <p className="mt-2 text-sm text-[#523A23]/40">
                    Shown on the
                    article list and at
                    the top of the
                    article.
                  </p>
                </div>
              </div>

              {/* Cover image */}
              <div>
                <CoverImageUpload
                  currentImageUrl={
                    article.cover_image_url
                  }
                  required
                />

                <p className="mt-2 text-sm text-[#523A23]/40">
                  Used on the article
                  list and at the top
                  of the published
                  article.
                </p>
              </div>
            </div>

            {/* Article information */}
            <div className="mt-8 rounded-xl border border-[#27430D]/10 bg-white p-5">
              <div>
                <h3 className="text-sm font-semibold text-[#27430D]">
                  Article information
                </h3>

                <p className="mt-1 text-sm text-[#523A23]/40">
                  Update the author
                  and category for
                  this article.
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Author */}
                <div className="px-3">
                  <label
                    htmlFor="author_name"
                    className="text-sm font-semibold text-[#27430D]"
                  >
                    Author{" "}
                    <RequiredMark />
                  </label>

                  <div className="mt-3">
                    <input
                      id="author_name"
                      name="author_name"
                      type="text"
                      required
                      defaultValue={
                        primaryAuthor
                      }
                      placeholder="Author name"
                      className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3.5 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#523A23]/35">
                    The name displayed
                    as the author of
                    this article.
                  </p>
                </div>

                {/* Category */}
                <div className="border-t border-[#27430D]/10 px-3 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                  <label
                    htmlFor="category"
                    className="text-sm font-semibold text-[#27430D]"
                  >
                    Category{" "}
                    <RequiredMark />
                  </label>

                  <div className="mt-3">
                    <input
                      id="category"
                      name="category"
                      type="text"
                      required
                      defaultValue={
                        article.category ??
                        ""
                      }
                      placeholder="e.g. Financial Literacy"
                      className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3.5 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#523A23]/35">
                    Used to group
                    related articles
                    across The
                    Compass.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article content */}
        <section className="bg-white px-5 pt-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-[#27430D]">
                Article content{" "}
                <RequiredMark />
              </label>

              <span className="text-xs text-[#523A23]/35">
                Required to save or
                publish
              </span>
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="bg-white px-5 pb-8">
          <div className="mx-auto max-w-6xl">
            <ArticleEditor
              initialContent={
                article.content ?? ""
              }
              stickyToolbarOffset={
                132
              }
            />
          </div>
        </section>
      </form>
    </div>
  );
}
