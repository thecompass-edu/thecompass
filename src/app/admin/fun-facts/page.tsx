import Link from "next/link";
import { redirect } from "next/navigation";

import FunFactActionsMenu from "@/components/admin/FunFactActionsMenu";
import ListFilters from "@/components/admin/ListFilters";
import { buildListHref } from "@/lib/admin/list-url";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 10;
const BASE_PATH = "/admin/fun-facts";

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

type FunFact = {
  id: string;
  title: string;
  description: string;
  fun_fact_number: number | null;
  image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getPageNumbers(current: number, total: number) {
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default async function FunFactsPage({
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
    supabase.from("fun_facts").select("id", { count: "exact", head: true }),
    supabase
      .from("fun_facts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("fun_facts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
  ]);

  const totalFunFacts = totalRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;
  const draftCount = draftRes.count ?? 0;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("fun_facts")
    .select(
      `
      id,
      title,
      description,
      fun_fact_number,
      image_url,
      status,
      published_at,
      created_at,
      updated_at
    `,
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
      query = query.ilike("title", `%${safe}%`);
    }
  }
  const { data, error, count } = await query.range(from, to);

  if (error?.code === "PGRST103" && page > 1) {
    redirect(buildListHref(BASE_PATH, { q, status, page: 1 }));
  }

  if (error) {
    console.error("FUN FACTS FETCH ERROR:", error);
  }

  const funFacts = (data ?? []) as FunFact[];
  const filteredCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const showingFrom = filteredCount === 0 ? 0 : from + 1;
  const showingTo = from + funFacts.length;
  const isFiltering = q !== "" || status !== "all";
  const hrefFor = (p: number) =>
    buildListHref(BASE_PATH, { q, status, page: p });

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* HEADER */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
            CONTENT
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
            Weekly Fun Facts
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7B886C] sm:text-base">
            Manage weekly financial fun facts.
          </p>
        </div>

        <Link
          href="/admin/fun-facts/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#27430D] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#35551A]"
        >
          New Fun Fact
        </Link>
      </div>

      {/* COUNTERS */}
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Total
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {totalFunFacts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Published
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Drafts
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {draftCount}
          </p>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <ListFilters
        basePath={BASE_PATH}
        q={q}
        status={status}
        statusOptions={STATUS_FILTERS}
        searchPlaceholder="Search by title"
      />

      {/* FUN FACT TABLE */}
      <div className="mt-6">
        {funFacts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[#27430D]/10 bg-white">
            {/* DESKTOP HEADER */}
            <div className="hidden grid-cols-[minmax(0,1.7fr)_150px_160px_100px] items-center gap-5 border-b border-[#27430D]/10 bg-[#F8F5EC] px-7 py-5 text-xs font-bold uppercase tracking-[0.14em] text-[#687704] md:grid">
              <span>Fun Fact</span>
              <span>Status</span>
              <span>Published</span>
              <span className="text-right">Action</span>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-[#27430D]/10">
              {funFacts.map((funFact) => (
                <div
                  key={funFact.id}
                  className="grid gap-5 px-7 py-6 transition hover:bg-[#FDFBF7] md:grid-cols-[minmax(0,1.7fr)_150px_160px_100px] md:items-center"
                >
                  {/* FUN FACT */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      {funFact.fun_fact_number && (
                        <span className="shrink-0 text-xs font-bold tracking-[0.12em] text-[#687704]">
                          #{funFact.fun_fact_number}
                        </span>
                      )}

                      <p className="truncate font-semibold text-[#27430D]">
                        {funFact.title}
                      </p>
                    </div>

                    {funFact.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-[#8D7765]">
                        {funFact.description}
                      </p>
                    )}
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                        funFact.status === "published"
                          ? "bg-[#EEF3E4] text-[#536B0F]"
                          : "bg-[#F6F1EA] text-[#765C43]"
                      }`}
                    >
                      {funFact.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* PUBLISHED DATE */}
                  <div className="text-sm text-[#8D7765]">
                    {funFact.status === "published"
                      ? formatDate(funFact.published_at)
                      : "—"}
                  </div>

                  {/* ACTION MENU */}
                  <div className="flex md:justify-end">
                    <FunFactActionsMenu
                      funFactId={funFact.id}
                      funFactTitle={funFact.title}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-4 border-t border-[#27430D]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#523A23]/60">
                Showing {showingFrom}–{showingTo} of {filteredCount} fun facts
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
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#27430D]/20 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-[#27430D]">
              {isFiltering ? "No matching fun facts" : "No Fun Facts yet"}
            </p>

            <p className="mt-2 text-sm text-[#7B886C]">
              {isFiltering
                ? "Try a different keyword or change the status filter."
                : "Create your first Weekly Fun Fact."}
            </p>

            {isFiltering ? (
              <Link
                href={BASE_PATH}
                className="mt-6 inline-flex rounded-xl bg-[#27430D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35551A]"
              >
                Clear filters
              </Link>
            ) : (
              <Link
                href="/admin/fun-facts/new"
                className="mt-6 inline-flex rounded-xl bg-[#27430D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35551A]"
              >
                Create Fun Fact
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}