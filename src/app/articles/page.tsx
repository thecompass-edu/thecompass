import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/home/Navbar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_name: string | null;
  category: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
};

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getReadingTime(content: string) {
  const textContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  const words = textContent.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlesPage() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        author_name,
        category,
        status,
        published_at,
        created_at
      `,
    )
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error("PUBLIC ARTICLES FETCH ERROR:", error);
  }

  const publishedArticles = (articles ?? []) as Article[];

  return (
    <main className="min-h-screen bg-white text-[#27430D]">
      {/* Navigation */}
      <Navbar />

      {/* Page Header */}
      <section className="mx-auto w-full max-w-293.75 px-5 pb-10 pt-16 sm:px-6 lg:px-7 lg:pb-14 lg:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#687704]">
          Explore
        </p>

        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#27430D] sm:text-5xl lg:text-6xl">
          Articles
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[#523A23]/65 sm:text-lg">
          Practical financial knowledge, ideas, and stories designed to help
          you make more confident decisions with money.
        </p>
      </section>

      {/* Divider */}
      <div className="mx-auto w-full max-w-293.75 px-5 sm:px-6 lg:px-7">
        <div className="border-t border-[#27430D]/10" />
      </div>

      {/* Articles */}
      <section className="mx-auto w-full max-w-293.75 px-5 py-12 sm:px-6 lg:px-7 lg:py-16">
        {publishedArticles.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-[#27430D]/10 bg-[#F8F6F0] px-6 py-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#687704]">
              Articles
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-[#27430D]">
              No published articles yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#523A23]/55">
              Published articles will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {publishedArticles.map((article) => {
              const publishedDate = formatDate(
                article.published_at ?? article.created_at,
              );

              const readingTime = getReadingTime(article.content);

              return (
                <article
                  key={article.id}
                  className="group border-b border-[#27430D]/10 py-10 first:pt-0 last:border-b-0 lg:py-12"
                >
                  <div className="grid gap-7 lg:grid-cols-[380px_1fr] lg:items-center lg:gap-12">
                    {/* Cover Image */}
                    <Link
                      href={`/articles/${article.slug}`}
                      className="block"
                    >
                      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-[#F0EEE7]">
                        {article.cover_image_url ? (
                          <Image
                            src={article.cover_image_url}
                            alt={article.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 380px"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-8 text-center">
                            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#27430D]/25">
                              The Compass
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Article Information */}
                    <div>
                      {/* Category */}
                      {article.category && (
                        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#687704]">
                          {article.category}
                        </p>
                      )}

                      {/* Title */}
                      <Link href={`/articles/${article.slug}`}>
                        <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-[#27430D] transition-colors duration-200 group-hover:text-[#687704] sm:text-3xl">
                          {article.title}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="mt-4 max-w-2xl text-base leading-7 text-[#523A23]/65">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-[#523A23]/50">
                        {article.author_name && (
                          <>
                            <span>
                              By{" "}
                              <span className="font-semibold text-[#27430D]">
                                {article.author_name}
                              </span>
                            </span>

                            <span aria-hidden="true">•</span>
                          </>
                        )}

                        {publishedDate && (
                          <>
                            <span>{publishedDate}</span>
                            <span aria-hidden="true">•</span>
                          </>
                        )}

                        <span>{readingTime} min read</span>
                      </div>

                      {/* Read Article - appears on hover */}
                      <div className="mt-6 min-h-6">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="
                            inline-flex
                            translate-y-2
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-[#27430D]
                            opacity-0
                            underline
                            decoration-[#687704]/40
                            underline-offset-4
                            transition-all
                            duration-300
                            ease-out

                            group-hover:translate-y-0
                            group-hover:opacity-100

                            hover:gap-3
                            hover:text-[#687704]
                          "
                        >
                          Read Article
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}