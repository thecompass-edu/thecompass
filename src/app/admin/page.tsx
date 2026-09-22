import DashboardStats from "@/sections/admin/DashboardStats";
import TopPerformingArticles from "@/sections/admin/TopPerformingArticles";
import VisitorCountries from "@/sections/admin/VisitorCountries";

import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

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
};

type ArticleView = {
  id: string;
  article_id: string;
};

function getCountryName(
  code: string,
) {
  if (
    !code ||
    code === "Unknown"
  ) {
    return "Unknown";
  }

  try {
    const displayNames =
      new Intl.DisplayNames(
        ["en"],
        {
          type: "region",
        },
      );

    return (
      displayNames.of(code) ??
      code
    );
  } catch {
    return code;
  }
}

export default async function AdminDashboardPage() {
  const supabase =
    await createClient();

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
        "id, country_code",
      ),

    supabase
      .from("article_views")
      .select(
        "id, article_id",
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

  const articleViewCounts =
    new Map<string, number>();

  viewRows.forEach((view) => {
    articleViewCounts.set(
      view.article_id,
      (articleViewCounts.get(
        view.article_id,
      ) ?? 0) + 1,
    );
  });

  const topArticles =
    articleRows
      .filter(
        (article) =>
          article.status ===
          "published",
      )
      .map((article) => ({
        ...article,
        views:
          articleViewCounts.get(
            article.id,
          ) ?? 0,
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

  const countryCounts =
    new Map<string, number>();

  visitRows.forEach(
    (visit) => {
      const countryCode =
        visit.country_code ||
        "Unknown";

      countryCounts.set(
        countryCode,
        (countryCounts.get(
          countryCode,
        ) ?? 0) + 1,
      );
    },
  );

  const visitorCountries =
    Array.from(
      countryCounts.entries(),
    )
      .map(
        ([code, visits]) => ({
          code,
          name:
            getCountryName(
              code,
            ),
          visits,
          percentage:
            totalVisits > 0
              ? Math.round(
                  (visits /
                    totalVisits) *
                    100,
                )
              : 0,
        }),
      )
      .sort(
        (a, b) =>
          b.visits -
          a.visits,
      )
      .slice(0, 5);

  const stats = [
    {
      label: "Total Visits",
      value: totalVisits,
      description:
        "Website visits",
    },
    {
      label: "Article Views",
      value:
        totalArticleViews,
      description:
        "Published article views",
    },
    {
      label: "Published",
      value:
        publishedCount,
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

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div>
        <p className="text-xs font-bold tracking-[0.25em] text-[#687704] sm:text-sm">
          OVERVIEW
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#8D7765] sm:text-base">
          Manage your articles and monitor website performance.
        </p>
      </div>

      <DashboardStats
        stats={stats}
      />

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <TopPerformingArticles
          articles={
            topArticles
          }
        />

        <VisitorCountries
          countries={
            visitorCountries
          }
        />
      </div>
    </div>
  );
}