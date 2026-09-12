import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import article1 from "@/assets/RecentArticle/article-1.png";
import article2 from "@/assets/RecentArticle/article-2.jpg";

type Article = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: StaticImageData;
};

const articles: Article[] = [
  {
    id: 1,
    title: "Why Digital Literacy Matters More Than Ever",
    excerpt:
      "a harsh truth where the rich keep spending and the poor tries to survive",
    date: "Sep 10, 2026",
    readTime: "3 min read",
    image: article1,
  },
  {
    id: 2,
    title: "Why Small Habits Matter More Than Big Goals",
    excerpt:
      "Big goals can give us direction, but the small things we do every day are often what actually determine whether we reach them.",
    date: "Sep 10, 2026",
    readTime: "3 min read",
    image: article2,
  },
];

export default function RecentArticles() {
  return (
    <section className="border-t border-[#27430D]/10 bg-[#F6F1EA]">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* LEFT SIDE */}
          <div>
            {/* Section Heading */}
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[0.25em] text-[#687704] sm:text-sm">
                  LATEST ARTICLES
                </p>

                <div className="flex items-center gap-5">
                  <h2 className="text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
                    Recent Articles
                  </h2>

                  <span className="hidden h-px w-9 bg-[#27430D] sm:block" />
                </div>
              </div>

              <Link
                href="/articles"
                className="hidden items-center gap-3 text-sm font-semibold text-[#27430D] transition-opacity hover:opacity-70 sm:flex"
              >
                View all articles
                <span aria-hidden="true">›</span>
              </Link>
            </div>

            {/* Article Cards */}
            <div className="space-y-6">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl border border-[#27430D]/10 bg-[#FEFEFE]"
                >
                  <div className="grid md:grid-cols-[35%_1fr]">
                    {/* Article Image */}
                    <div className="relative min-h-60 overflow-hidden md:min-h-76.25">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 35vw"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="flex flex-col justify-center px-6 py-7 sm:px-8 lg:px-9">
                      <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#687704]">
                        ARTICLE
                      </p>

                      <h3 className="max-w-2xl text-2xl font-bold leading-tight text-[#27430D] sm:text-[28px]">
                        {article.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#7B886C]/75 sm:text-base">
                        {article.excerpt}
                      </p>

                      <div className="mt-4 flex items-center gap-3 text-sm text-[#7B886C]/50">
                        <span>{article.date}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                      </div>

                      <Link
                        href="#"
                        className="mt-5 inline-flex w-fit items-center gap-4 font-semibold text-[#27430D] transition-opacity hover:opacity-70"
                      >
                        Read Article
                        <span aria-hidden="true">›</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile View All */}
            <Link
              href="/articles"
              className="mt-7 flex items-center justify-center gap-3 rounded-xl border border-[#27430D]/10 bg-[#FEFEFE] py-4 text-sm font-semibold text-[#27430D] sm:hidden"
            >
              View all articles
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <aside className="lg:pt-20.25">
            <div className="rounded-2xl border border-[#27430D]/10 bg-[#FEFEFE]/70 p-6">
              {/* Fun Fact Header */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#687704]/30 bg-[#F6F1EA]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#687704]"
                  >
                    <path
                      d="M9 18h6M10 22h4M8.5 15.5C6.96 14.42 6 12.64 6 10.5a6 6 0 1112 0c0 2.14-.96 3.92-2.5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="text-sm font-bold tracking-[0.14em] text-[#27430D]">
                  WEEKLY FUN FACT
                </p>
              </div>

              {/* Fun Fact Placeholder */}
              <div className="flex aspect-4/3 items-center justify-center overflow-hidden rounded-xl bg-[#F6F1EA]">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687704]">
                    Fun Fact Image
                  </p>

                  <p className="mt-1 text-sm text-[#523A23]/50">
                    Placeholder
                  </p>
                </div>
              </div>

              {/* Fun Fact Content */}
              <div className="mt-6">
                <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
                  FUN FACT #1
                </p>

                <h3 className="mt-3 text-2xl font-bold text-[#27430D]">
                  Fun Fact Title
                </h3>

                <p className="mt-3 text-sm text-[#523A23]/50">
                  Sep 12, 2026
                </p>
              </div>

              <Link
                href="#"
                className="mt-7 flex items-center justify-between rounded-xl border border-[#687704]/30 bg-[#F6F1EA] px-5 py-4 font-semibold text-[#27430D] transition-colors hover:bg-[#687704]/10"
              >
                View Story
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}