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
};

type ArticleView = {
  id: string;
  article_id: string;
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

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  /* -------------------------------------------------
     FETCH DASHBOARD DATA
  ------------------------------------------------- */

  const [
    { data: articles, error: articlesError },
    { data: siteVisits, error: visitsError },
    { data: articleViews, error: viewsError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, slug, status"),

    supabase
      .from("site_visits")
      .select("id, country_code"),

    supabase
      .from("article_views")
      .select("id, article_id"),
  ]);

  if (articlesError) {
    console.error("DASHBOARD ARTICLES ERROR:", articlesError);
  }

  if (visitsError) {
    console.error("DASHBOARD SITE VISITS ERROR:", visitsError);
  }

  if (viewsError) {
    console.error("DASHBOARD ARTICLE VIEWS ERROR:", viewsError);
  }

  const articleRows = (articles ?? []) as Article[];
  const visitRows = (siteVisits ?? []) as SiteVisit[];
  const viewRows = (articleViews ?? []) as ArticleView[];

  /* -------------------------------------------------
     COUNTERS
  ------------------------------------------------- */

  const publishedCount = articleRows.filter(
    (article) => article.status === "published",
  ).length;

  const draftCount = articleRows.filter(
    (article) => article.status === "draft",
  ).length;

  const totalVisits = visitRows.length;

  const totalArticleViews = viewRows.length;

  /* -------------------------------------------------
     TOP PERFORMING ARTICLES
  ------------------------------------------------- */

  const articleViewCounts = new Map<string, number>();

  viewRows.forEach((view) => {
    articleViewCounts.set(
      view.article_id,
      (articleViewCounts.get(view.article_id) ?? 0) + 1,
    );
  });

  const topArticles = articleRows
    .filter((article) => article.status === "published")
    .map((article) => ({
      ...article,
      views: articleViewCounts.get(article.id) ?? 0,
    }))
    .filter((article) => article.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  /* -------------------------------------------------
     VISITOR COUNTRIES
  ------------------------------------------------- */

  const countryCounts = new Map<string, number>();

  visitRows.forEach((visit) => {
    const countryCode = visit.country_code || "Unknown";

    countryCounts.set(
      countryCode,
      (countryCounts.get(countryCode) ?? 0) + 1,
    );
  });

  const visitorCountries = Array.from(countryCounts.entries())
    .map(([code, visits]) => ({
      code,
      name: getCountryName(code),
      visits,
      percentage:
        totalVisits > 0
          ? Math.round((visits / totalVisits) * 100)
          : 0,
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const stats = [
    {
      label: "Total Visits",
      value: totalVisits,
      description: "Website visits",
    },
    {
      label: "Article Views",
      value: totalArticleViews,
      description: "Published article views",
    },
    {
      label: "Published",
      value: publishedCount,
      description: "Published articles",
    },
    {
      label: "Drafts",
      value: draftCount,
      description: "Unpublished articles",
    },
  ];

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
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

      {/* Statistic Cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="
              rounded-2xl
              border
              border-[#27430D]/10
              bg-white
              px-6
              py-7
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#687704]/30
              hover:shadow-[0_12px_30px_rgba(39,67,13,0.06)]
            "
          >
            <p className="text-sm text-[#9A806E] sm:text-base">
              {stat.label}
            </p>

            <p className="mt-5 text-4xl font-semibold tracking-tight text-[#27430D]">
              {stat.value.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-[#9A806E]/60">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Top Performing Articles */}
        <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6 sm:p-7">
          <div>
            <p className="text-xl font-semibold text-[#27430D] sm:text-2xl">
              Top Performing Articles
            </p>

            <p className="mt-1 text-sm text-[#9A806E] sm:text-base">
              Your most viewed published articles.
            </p>
          </div>

          {topArticles.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-xl bg-[#F8F5EC]">
              {topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-6
                    border-b
                    border-[#27430D]/10
                    px-5
                    py-4
                    last:border-b-0
                    sm:px-6
                  "
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#27430D]/10 text-sm font-semibold text-[#27430D]">
                      {index + 1}
                    </span>

                    <p className="truncate text-sm font-medium text-[#27430D] sm:text-base">
                      {article.title}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[#27430D]">
                      {article.views.toLocaleString()}
                    </p>

                    <p className="text-xs text-[#9A806E]">
                      {article.views === 1 ? "view" : "views"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-64 items-center justify-center rounded-xl bg-[#F8F5EC] px-6 text-center">
              <div>
                <p className="text-sm text-[#9A806E]">
                  No article view data yet
                </p>

                <p className="mt-2 max-w-sm text-xs leading-5 text-[#9A806E]/60">
                  Article performance will appear here once visitors begin
                  reading your articles.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Visitor Countries */}
        <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6 sm:p-7">
          <div>
            <p className="text-xl font-semibold text-[#27430D] sm:text-2xl">
              Visitor Countries
            </p>

            <p className="mt-1 text-sm text-[#9A806E] sm:text-base">
              Where your website visitors are coming from.
            </p>
          </div>

          {visitorCountries.length > 0 ? (
            <div className="mt-8 space-y-5 rounded-xl bg-[#F8F5EC] p-5 sm:p-6">
              {visitorCountries.map((country) => (
                <div key={country.code}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#27430D] sm:text-base">
                        {country.name}
                      </p>

                      <p className="mt-0.5 text-xs text-[#9A806E]">
                        {country.visits.toLocaleString()}{" "}
                        {country.visits === 1
                          ? "visit"
                          : "visits"}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-[#27430D]">
                      {country.percentage}%
                    </p>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#27430D]/10">
                    <div
                      className="h-full rounded-full bg-[#687704]"
                      style={{
                        width: `${country.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 flex min-h-64 items-center justify-center rounded-xl bg-[#F8F5EC] px-6 text-center">
              <div>
                <p className="text-sm text-[#9A806E]">
                  No visitor data yet
                </p>

                <p className="mt-2 max-w-xs text-xs leading-5 text-[#9A806E]/60">
                  Country analytics will appear here once visitors begin using
                  the website.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}