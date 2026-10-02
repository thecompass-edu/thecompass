import Link from "next/link";
import { redirect } from "next/navigation";
import ArticleActionsMenu from "@/components/admin/ArticleActionsMenu";
import ListFilters from "@/components/admin/ListFilters";
import { buildListHref } from "@/lib/admin/list-url";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 10;
const BASE_PATH = "/admin/articles";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

function getPageNumbers(current: number, total: number) {
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status: StatusFilter =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const supabase = await createClient();

  const [totalRes, publishedRes, draftRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
  ]);

  const totalArticles = totalRes.count ?? 0;
  const publishedArticles = publishedRes.count ?? 0;
  const draftArticles = draftRes.count ?? 0;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("articles")
    .select(
      "id, title, slug, status, category, is_featured, published_at, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (q) {
    const safe = q.replace(/[,()%_\\*"']/g, " ").replace(/\s+/g, " ").trim();
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,category.ilike.%${safe}%`);
    }
  }

  const { data: articles, error, count } = await query.range(from, to);

  if (error?.code === "PGRST103" && page > 1) {
    redirect(buildListHref(BASE_PATH, { q, status, page: 1 }));
  }

  if (error) {
    console.error("Failed to load articles:", error);
  }

  const articleList = articles ?? [];
  const filteredCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const showingFrom = filteredCount === 0 ? 0 : from + 1;
  const showingTo = from + articleList.length;
  const isFiltering = q !== "" || status !== "all";
  const hrefFor = (p: number) =>
    buildListHref(BASE_PATH, { q, status, page: p });

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
            CONTENT
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
            Articles
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#7B886C] sm:text-base">
            Manage Compass articles.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#27430D] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#35551A]"
        >
          New Article
        </Link>
      </div>

      {/* Statistics */}
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
          <p className="text-sm font-semibold text-[#523A23]">Total Articles</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#27430D]">
            {totalArticles}
          </p>
          <p className="mt-2 text-sm text-[#523A23]/50">All Compass content</p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
          <p className="text-sm font-semibold text-[#523A23]">Published</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#27430D]">
            {publishedArticles}
          </p>
          <p className="mt-2 text-sm text-[#523A23]/50">
            Live on the public website
          </p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
          <p className="text-sm font-semibold text-[#523A23]">Drafts</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#27430D]">
            {draftArticles}
          </p>
          <p className="mt-2 text-sm text-[#523A23]/50">
            Work still in progress
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <ListFilters
        basePath={BASE_PATH}
        q={q}
        status={status}
        statusOptions={STATUS_FILTERS}
        searchPlaceholder="Search by title or category..."
      />

      {/* Article List */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#27430D]/10 bg-white">
        {articleList.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F6F1EA]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6 text-[#687704]"
                aria-hidden="true"
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
              {isFiltering ? "No matching articles" : "No articles yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#523A23]/55">
              {isFiltering
                ? "Try a different keyword or change the status filter."
                : "Create your first article to start publishing content on The Compass."}
            </p>

            {isFiltering ? (
              <Link
                href={BASE_PATH}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#687704]"
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/admin/articles/new"
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#687704]"
              >
                Create Article
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-200">
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
                    <th className="w-20 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {articleList.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-[#27430D]/5 transition hover:bg-[#F6F1EA]/25 last:border-b-0"
                    >
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

                      <td className="px-6 py-5 text-sm text-[#523A23]/65">
                        {article.category || "—"}
                      </td>

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

                      <td className="w-20 px-4 py-5 text-center">
                        <ArticleActionsMenu
                          articleId={article.id}
                          articleTitle={article.title}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-[#27430D]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#523A23]/60">
                Showing {showingFrom}–{showingTo} of {filteredCount} articles
              </p>

              {totalPages > 1 && (
                <nav
                  className="flex items-center gap-1"
                  aria-label="Pagination"
                >
                  {page > 1 ? (
                    <Link
                      href={hrefFor(page - 1)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/70 transition hover:bg-[#F6F1EA]"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/30">
                      Previous
                    </span>
                  )}

                  {getPageNumbers(page, totalPages).map((n) => (
                    <Link
                      key={n}
                      href={hrefFor(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`min-w-9 rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                        n === page
                          ? "bg-[#27430D] text-white"
                          : "text-[#523A23]/70 hover:bg-[#F6F1EA]"
                      }`}
                    >
                      {n}
                    </Link>
                  ))}

                  {page < totalPages ? (
                    <Link
                      href={hrefFor(page + 1)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/70 transition hover:bg-[#F6F1EA]"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/30">
                      Next
                    </span>
                  )}
                </nav>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}