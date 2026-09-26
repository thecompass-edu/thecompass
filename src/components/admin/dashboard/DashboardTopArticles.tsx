type TopArticle = {
  id: string;
  title: string;
  views: number;
  previousViews: number;
  trend: number | null;
};

type DashboardTopArticlesProps = {
  articles: TopArticle[];
  periodLabel: string;
};

function Trend({
  value,
}: {
  value: number | null;
}) {
  if (value === null) {
    return (
      <span className="text-sm font-medium text-[#8D7765]/70">
        —
      </span>
    );
  }

  if (value === 0) {
    return (
      <span className="text-sm font-semibold text-[#8D7765]">
        0%
      </span>
    );
  }

  const isPositive = value > 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${
        isPositive
          ? "text-[#687704]"
          : "text-red-600"
      }`}
    >
      <span aria-hidden="true">
        {isPositive ? "↗" : "↘"}
      </span>

      {Math.abs(value)}%
    </span>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M7 17V12M12 17V7M17 17V10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function DashboardTopArticles({
  articles,
  periodLabel,
}: DashboardTopArticlesProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#27430D]/10 bg-white">
      {/* Header */}
      <div className="border-b border-[#27430D]/8 px-6 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#687704]/15 bg-[#EEF3E7] text-[#687704]">
            <ChartIcon />
          </span>

          <div>
            <h2 className="text-xl font-semibold text-[#27430D] sm:text-2xl">
              Top Performing Articles
            </h2>

            <p className="mt-1 text-sm text-[#8D7765]">
              Ranked by views · {periodLabel}
            </p>
          </div>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="px-6 pb-3 sm:px-7">
          {/* Columns */}
          <div className="grid grid-cols-[44px_minmax(0,1fr)_70px_80px] border-b border-[#27430D]/8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8D7765]">
            <span>#</span>

            <span>Article</span>

            <span className="text-right">
              Views
            </span>

            <span className="text-right">
              Trend
            </span>
          </div>

          {/* Articles */}
          <div className="max-h-100 overflow-y-auto pr-1">
            {articles.map(
              (article, index) => (
                <div
                  key={article.id}
                  className="grid min-h-20 grid-cols-[44px_minmax(0,1fr)_70px_80px] items-center border-b border-[#27430D]/8 py-4 last:border-b-0"
                >
                  <span className="text-sm text-[#8D7765]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-semibold text-[#27430D] sm:text-base">
                      {article.title}
                    </p>

                    {article.trend !== null && (
                      <p className="mt-1 text-xs text-[#8D7765]/75">
                        Previous:{" "}
                        {article.previousViews}{" "}
                        {article.previousViews === 1
                          ? "view"
                          : "views"}
                      </p>
                    )}
                  </div>

                  <span className="text-right text-sm font-semibold text-[#27430D] sm:text-base">
                    {article.views.toLocaleString()}
                  </span>

                  <div className="flex justify-end">
                    <Trend
                      value={
                        article.trend
                      }
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-50 items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm font-medium text-[#27430D]">
              No article view data yet
            </p>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[#8D7765]/70">
              Top-performing articles will appear here once visitors start
              reading your published articles.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}