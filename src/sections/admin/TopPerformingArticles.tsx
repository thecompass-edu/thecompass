type TopArticle = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
};

type TopPerformingArticlesProps = {
  articles: TopArticle[];
};

export default function TopPerformingArticles({
  articles,
}: TopPerformingArticlesProps) {
  return (
    <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6 sm:p-7">
      <div>
        <p className="text-xl font-semibold text-[#27430D] sm:text-2xl">
          Top Performing Articles
        </p>

        <p className="mt-1 text-sm text-[#9A806E] sm:text-base">
          Your most viewed published articles.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="mt-8 overflow-hidden rounded-xl bg-[#F8F5EC]">
          {articles.map(
            (article, index) => (
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
                    {article.views === 1
                      ? "view"
                      : "views"}
                  </p>
                </div>
              </div>
            ),
          )}
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
  );
}