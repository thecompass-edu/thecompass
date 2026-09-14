import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function ArticlesPage() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, status, category, is_featured, published_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load articles:", error);
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
            CONTENT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#27430D]">
            Articles
          </h1>

          <p className="mt-2 text-sm text-[#523A23]/60">
            Create, edit, publish, and manage Compass articles.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#687704]"
        >
          New Article
        </Link>
      </div>

      {/* Article List */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#27430D]/10 bg-white">
        <div className="border-b border-[#27430D]/10 px-6 py-5">
          <h2 className="font-semibold text-[#27430D]">
            All Articles
          </h2>

          <p className="mt-1 text-sm text-[#523A23]/50">
            {articles?.length ?? 0}{" "}
            {(articles?.length ?? 0) === 1 ? "article" : "articles"}
          </p>
        </div>

        {!articles || articles.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F6F1EA]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-[#687704]"
              >
                <path
                  d="M7 3.75h7.5L19 8.25V20.25H7V3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                <path
                  d="M14 4V9H19M10 13H16M10 16H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-[#27430D]">
              No articles yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#523A23]/55">
              Create your first article to start publishing content on The
              Compass.
            </p>

            <Link
              href="/admin/articles/new"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#687704]"
            >
              Create Article
            </Link>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#27430D]/10 bg-[#F6F1EA]/60 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                    Article
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                    Published
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-[#27430D]/5 last:border-b-0"
                  >
                    {/* Article */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#27430D]">
                          {article.title}
                        </p>

                        {article.is_featured && (
                          <span className="rounded-full bg-[#687704]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#687704]">
                            Featured
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#523A23]/45">
                        /{article.slug}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          article.status === "published"
                            ? "bg-[#687704]/10 text-[#687704]"
                            : "bg-[#523A23]/10 text-[#523A23]/70"
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-5 text-sm text-[#523A23]/65">
                      {article.category || "—"}
                    </td>

                    {/* Published Date */}
                    <td className="px-6 py-5 text-sm text-[#523A23]/65">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm font-semibold text-[#27430D] transition hover:text-[#687704]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}