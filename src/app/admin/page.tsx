import Link from "next/link";

import DashboardTopArticles from "@/components/admin/dashboard/DashboardTopArticles";
import DashboardViewsOverview from "@/components/admin/dashboard/DashboardViewsOverview";
import DashboardVisitorCountries from "@/components/admin/dashboard/DashboardVisitorCountries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Article = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type SiteVisit = {
  id: string;
  country_code: string | null;
  created_at: string | null;
};

type ArticleView = {
  id: string;
  article_id: string;
  created_at: string | null;
};

type TopArticle = {
  id: string;
  title: string;
  views: number;
  previousViews: number;
  trend: number | null;
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
    const displayNames = new Intl.DisplayNames(["en"], {
      type: "region",
    });

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

function addDays(
  date: Date,
  amount: number,
) {
  const copy = new Date(date);

  copy.setDate(
    copy.getDate() + amount,
  );

  return copy;
}

function isDateInRange(
  value: string | null,
  start: Date,
  end: Date,
) {
  if (!value) {
    return false;
  }

  const date = startOfDay(
    new Date(value),
  );

  return (
    date >= start &&
    date <= end
  );
}

function getTrend(
  current: number,
  previous: number,
) {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }

    return 100;
  }

  return Math.round(
    ((current - previous) /
      previous) *
      100,
  );
}

export default async function AdminDashboardPage() {
  const supabase =
    await createClient();

  // Dashboard data
  const [
    {
      data: articles,
      error: articlesError,
    },
    {
      data: siteVisits,
      error: visitsError,
    },
    {
      data: articleViews,
      error: viewsError,
    },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, title, slug, status",
      ),

    supabase
      .from("site_visits")
      .select(
        "id, country_code, created_at:visited_at",
      ),

    supabase
      .from("article_views")
      .select(
        "id, article_id, created_at",
      ),
  ]);

  if (articlesError) {
    console.error(
      "DASHBOARD ARTICLES ERROR:",
      articlesError,
    );
  }

  if (visitsError) {
    console.error(
      "DASHBOARD SITE VISITS ERROR:",
      visitsError,
    );
  }

  if (viewsError) {
    console.error(
      "DASHBOARD ARTICLE VIEWS ERROR:",
      viewsError,
    );
  }

  const articleRows =
    (articles ?? []) as Article[];

  const visitRows =
    (siteVisits ?? []) as SiteVisit[];

  const viewRows =
    (articleViews ?? []) as ArticleView[];

  // Counters
  const publishedCount =
    articleRows.filter(
      (article) =>
        article.status ===
        "published",
    ).length;

  const draftCount =
    articleRows.filter(
      (article) =>
        article.status ===
        "draft",
    ).length;

  const totalVisits =
    visitRows.length;

  const totalArticleViews =
    viewRows.length;

  const stats = [
    {
      label: "Total Visits",
      value: totalVisits,
      description:
        "Website visits",
    },
    {
      label: "Article Views",
      value: totalArticleViews,
      description:
        "Published article views",
    },
    {
      label: "Published",
      value: publishedCount,
      description:
        "Published articles",
    },
    {
      label: "Drafts",
      value: draftCount,
      description:
        "Unpublished articles",
    },
  ];

  // 30-day period
  const today =
    startOfDay(new Date());

  const currentStart =
    addDays(today, -29);

  const previousEnd =
    addDays(
      currentStart,
      -1,
    );

  const previousStart =
    addDays(
      previousEnd,
      -29,
    );

  const hasTimedArticleViews =
    viewRows.some(
      (view) =>
        Boolean(
          view.created_at,
        ),
    );

  // Top articles
  const publishedArticles =
    articleRows.filter(
      (article) =>
        article.status ===
        "published",
    );

  let topArticles: TopArticle[];

  if (hasTimedArticleViews) {
    topArticles =
      publishedArticles
        .map((article) => {
          const currentViews =
            viewRows.filter(
              (view) =>
                view.article_id ===
                  article.id &&
                isDateInRange(
                  view.created_at,
                  currentStart,
                  today,
                ),
            ).length;

          const previousViews =
            viewRows.filter(
              (view) =>
                view.article_id ===
                  article.id &&
                isDateInRange(
                  view.created_at,
                  previousStart,
                  previousEnd,
                ),
            ).length;

          return {
            id: article.id,
            title:
              article.title,
            views:
              currentViews,
            previousViews,
            trend:
              getTrend(
                currentViews,
                previousViews,
              ),
          };
        })
        .filter(
          (article) =>
            article.views > 0,
        )
        .sort(
          (a, b) =>
            b.views -
            a.views,
        )
        .slice(0, 5);
  } else {
    const viewCounts =
      new Map<
        string,
        number
      >();

    viewRows.forEach(
      (view) => {
        viewCounts.set(
          view.article_id,
          (viewCounts.get(
            view.article_id,
          ) ?? 0) + 1,
        );
      },
    );

    topArticles =
      publishedArticles
        .map((article) => ({
          id: article.id,
          title:
            article.title,
          views:
            viewCounts.get(
              article.id,
            ) ?? 0,
          previousViews: 0,
          trend: null,
        }))
        .filter(
          (article) =>
            article.views > 0,
        )
        .sort(
          (a, b) =>
            b.views -
            a.views,
        )
        .slice(0, 5);
  }

  // Visitor countries
  const periodVisitRows =
    visitRows.filter(
      (visit) =>
        isDateInRange(
          visit.created_at,
          currentStart,
          today,
        ),
    );

  const countryCounts =
    new Map<
      string,
      number
    >();

  periodVisitRows.forEach(
    (visit) => {
      const countryCode =
        visit.country_code
          ?.trim()
          .toUpperCase() ||
        "Unknown";

      countryCounts.set(
        countryCode,
        (countryCounts.get(
          countryCode,
        ) ?? 0) + 1,
      );
    },
  );

  const periodVisitors =
    periodVisitRows.length;

  const visitorCountries:
    VisitorCountry[] =
    Array.from(
      countryCounts.entries(),
    )
      .map(
        ([
          code,
          visits,
        ]) => ({
          code,
          name:
            getCountryName(
              code,
            ),
          visits,
          percentage:
            periodVisitors > 0
              ? Number(
                  (
                    (visits /
                      periodVisitors) *
                    100
                  ).toFixed(1),
                )
              : 0,
        }),
      )
      .sort(
        (a, b) =>
          b.visits -
          a.visits,
      )
      .slice(0, 6);

  // Chart data
  const chartVisits =
    visitRows
      .filter(
        (
          visit,
        ): visit is SiteVisit & {
          created_at: string;
        } =>
          Boolean(
            visit.created_at,
          ),
      )
      .map((visit) => ({
        created_at:
          visit.created_at,
      }));

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-[#687704] sm:text-sm">
            OVERVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#8D7765] sm:text-base">
            Manage your articles
            and monitor website
            performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/fun-facts/new"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#27430D]/15 bg-white px-5 text-sm font-semibold text-[#27430D] transition hover:border-[#687704]/40 hover:bg-[#F8F5EC]"
          >
            New Fun Fact
          </Link>

          <Link
            href="/admin/articles/new"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#35591A]"
          >
            New Article
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          (stat) => (
            <div
              key={
                stat.label
              }
              className="rounded-3xl border border-[#27430D]/10 bg-white px-6 py-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#687704]/25 hover:shadow-[0_16px_40px_rgba(39,67,13,0.06)]"
            >
              <p className="text-sm font-medium text-[#9A806E] sm:text-base">
                {
                  stat.label
                }
              </p>

              <p className="mt-4 text-4xl font-semibold tracking-tight text-[#27430D]">
                {stat.value.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-[#9A806E]/70">
                {
                  stat.description
                }
              </p>
            </div>
          ),
        )}
      </div>

      {/* Views */}
      <DashboardViewsOverview
        visits={chartVisits}
      />

      {/* Analytics */}
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <DashboardTopArticles
          articles={
            topArticles
          }
          periodLabel={
            hasTimedArticleViews
              ? "Last 30 days"
              : "All recorded views"
          }
        />

        <DashboardVisitorCountries
          countries={
            visitorCountries
          }
          totalVisitors={
            periodVisitors
          }
          periodLabel="Last 30 days"
        />
      </div>
    </div>
  );
}