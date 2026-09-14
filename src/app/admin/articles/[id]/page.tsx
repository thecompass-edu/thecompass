import CoverImageUpload from "@/components/admin/CoverImageUpload";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { deleteArticle, updateArticle } from "./actions";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditArticlePage({
  params,
  searchParams,
}: EditArticlePageProps) {
  const { id } = await params;
  const { error: pageError } = await searchParams;

  const supabase = await createClient();

  const { data: article, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  /*
   * Show the actual Supabase error instead of
   * immediately turning every error into a 404.
   */
  if (fetchError) {
    console.error("ARTICLE FETCH ERROR:", fetchError);

    return (
      <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
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
            Supabase returned an error while trying to load this article.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-xl bg-red-50 p-4 text-xs text-red-700">
            {JSON.stringify(fetchError, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  /*
   * Article ID exists in the URL,
   * but no matching database row exists.
   */
  if (!article) {
    return (
      <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
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

  const updateArticleWithId = updateArticle.bind(null, article.id);
  const deleteArticleWithId = deleteArticle.bind(null, article.id);

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/articles"
          className="text-sm font-semibold text-[#687704] transition hover:text-[#27430D]"
        >
          ← Back to Articles
        </Link>

        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-[#687704]">
          CONTENT
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#27430D]">
          Edit Article
        </h1>

        <p className="mt-2 text-sm text-[#523A23]/60">
          Update article content and publishing settings.
        </p>
      </div>

      {/* Error */}
      {pageError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <form action={updateArticleWithId}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Content */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
              <h2 className="text-lg font-bold text-[#27430D]">
                Article Details
              </h2>

              <div className="mt-6 space-y-5">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={article.title}
                    className="w-full rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Slug
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    defaultValue={article.slug}
                    className="w-full rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label
                    htmlFor="excerpt"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Excerpt
                  </label>

                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={3}
                    defaultValue={article.excerpt ?? ""}
                    className="w-full resize-none rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>

                {/* Content */}
                <div>
                  <label
                    htmlFor="content"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Article Content
                  </label>

                  <textarea
                    id="content"
                    name="content"
                    rows={16}
                    defaultValue={article.content ?? ""}
                    className="w-full resize-y rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm leading-7 text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Publishing */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
              <h2 className="text-lg font-bold text-[#27430D]">
                Publishing
              </h2>

              <div className="mt-6 space-y-5">
                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={article.status}
                    className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm text-[#27430D] outline-none focus:border-[#687704]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Category
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    defaultValue={article.category ?? ""}
                    className="w-full rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>

                {/* Author */}
                <div>
                  <label
                    htmlFor="author_name"
                    className="mb-2 block text-sm font-semibold text-[#27430D]"
                  >
                    Author
                  </label>

                  <input
                    id="author_name"
                    name="author_name"
                    type="text"
                    defaultValue={article.author_name ?? ""}
                    className="w-full rounded-xl border border-[#27430D]/15 px-4 py-3 text-sm text-[#27430D] outline-none transition focus:border-[#687704]"
                  />
                </div>

                {/* Cover Image */}
                <CoverImageUpload
                  currentImageUrl={article.cover_image_url}
                />

                {/* Featured */}
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#F6F1EA] p-4">
                  <input
                    name="is_featured"
                    type="checkbox"
                    defaultChecked={article.is_featured}
                    className="mt-1 h-4 w-4 accent-[#27430D]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#27430D]">
                      Featured Article
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#523A23]/50">
                      Display this in the Featured Read section.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {/* Actions */}
            <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-[#27430D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#687704]"
              >
                Save Changes
              </button>

              <Link
                href="/admin/articles"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#27430D]/15 px-5 py-3 text-sm font-semibold text-[#27430D] transition hover:bg-[#F6F1EA]"
              >
                Cancel
              </Link>
            </section>
          </div>
        </div>
      </form>

      {/* Delete */}
      <section className="mt-6 rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="font-bold text-red-700">
          Delete Article
        </h2>

        <p className="mt-2 text-sm text-[#523A23]/55">
          Permanently remove this article and its cover image.
        </p>

        <form action={deleteArticleWithId}>
          <button
            type="submit"
            className="mt-4 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Delete Article
          </button>
        </form>
      </section>
    </div>
  );
}