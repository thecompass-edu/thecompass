import Link from "next/link";
import ListFilters from "@/components/admin/ListFilters";
import { buildListHref } from "@/lib/admin/list-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 10;
const BASE_PATH = "/admin/visitors";

type SearchParams = {
  q?: string;
  page?: string;
};

type SiteVisit = {
  id: string;
  country_code: string | null;
  created_at: string | null;
};

type VisitorCountry = {
  code: string;
  name: string;
  visits: number;
  percentage: number;
};

function getCountryName(code: string) {
  if (!code || code === "Unknown") {
    return "Unknown";
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function isDateInRange(value: string | null, start: Date, end: Date) {
  if (!value) return false;
  const date = startOfDay(new Date(value));
  return date >= start && date <= end;
}

function getPageNumbers(current: number, total: number) {
  const windowSize = 5;
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_visits")
    .select("id, country_code, created_at:visited_at");

  if (error) {
    console.error("VISITORS FETCH ERROR:", error);
  }

  const visitRows = (data ?? []) as SiteVisit[];

  const today = startOfDay(new Date());
  const currentStart = addDays(today, -29);

  const periodVisitRows = visitRows.filter((visit) =>
    isDateInRange(visit.created_at, currentStart, today),
  );
  const periodVisitors = periodVisitRows.length;

  const countryCounts = new Map<string, number>();
  periodVisitRows.forEach((visit) => {
    const code = visit.country_code?.trim().toUpperCase() || "Unknown";
    countryCounts.set(code, (countryCounts.get(code) ?? 0) + 1);
  });

  let allCountries: VisitorCountry[] = Array.from(countryCounts.entries())
    .map(([code, visits]) => ({
      code,
      name: getCountryName(code),
      visits,
      percentage:
        periodVisitors > 0
          ? Number(((visits / periodVisitors) * 100).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.visits - a.visits);

  const isFiltering = q !== "";
  if (q) {
    allCountries = allCountries.filter((country) =>
      country.name.toLowerCase().includes(q),
    );
  }

  const filteredCount = allCountries.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const countryList = allCountries.slice(from, to);

  const showingFrom = filteredCount === 0 ? 0 : from + 1;
  const showingTo = from + countryList.length;
  const hrefFor = (p: number) =>
    buildListHref(BASE_PATH, { q: params.q ?? "", page: p });

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
          ANALYTICS
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
          Visitors by Country
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#7B886C] sm:text-base">
          {periodVisitors.toLocaleString()}{" "}
          {periodVisitors === 1 ? "visitor" : "visitors"} · Last 30 days
        </p>
      </div>

      {/* Search */}
      <ListFilters
        basePath={BASE_PATH}
        q={params.q ?? ""}
        status="all"
        searchPlaceholder="Search by country..."
      />

      {/* Country Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#27430D]/10 bg-white">
        {countryList.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <h3 className="mt-4 text-lg font-semibold text-[#27430D]">
              {isFiltering ? "No matching countries" : "No visitor data yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#523A23]/55">
              {isFiltering
                ? "Try a different keyword."
                : "Country analytics will appear here once visitors start using The Compass."}
            </p>

            {isFiltering && (
              <Link
                href={BASE_PATH}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#687704]"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead>
                  <tr className="border-b border-[#27430D]/10 bg-[#F6F1EA]/60 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                      Country
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                      Visits
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#523A23]/55">
                      Share
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {countryList.map((country) => (
                    <tr
                      key={country.code}
                      className="border-b border-[#27430D]/5 transition hover:bg-[#F6F1EA]/25 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#27430D]">
                          {country.name}
                        </p>
                        <p className="mt-1 text-xs text-[#523A23]/45">
                          {country.code === "Unknown"
                            ? "Unknown location"
                            : country.code}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-right text-sm font-semibold text-[#27430D]">
                        {country.visits.toLocaleString()}
                      </td>

                      <td className="px-6 py-5 text-right text-sm text-[#523A23]/65">
                        {country.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-[#27430D]/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#523A23]/60">
                Showing {showingFrom}–{showingTo} of {filteredCount} countries
              </p>

              {totalPages > 1 && (
                <nav
                  className="flex items-center gap-1"
                  aria-label="Pagination"
                >
                  {safePage > 1 ? (
                    <Link
                      href={hrefFor(safePage - 1)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/70 transition hover:bg-[#F6F1EA]"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="rounded-lg px-3 py-2 text-sm font-semibold text-[#523A23]/30">
                      Previous
                    </span>
                  )}

                  {getPageNumbers(safePage, totalPages).map((n) => (
                    <Link
                      key={n}
                      href={hrefFor(n)}
                      aria-current={n === safePage ? "page" : undefined}
                      className={`min-w-9 rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${
                        n === safePage
                          ? "bg-[#27430D] text-white"
                          : "text-[#523A23]/70 hover:bg-[#F6F1EA]"
                      }`}
                    >
                      {n}
                    </Link>
                  ))}

                  {safePage < totalPages ? (
                    <Link
                      href={hrefFor(safePage + 1)}
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