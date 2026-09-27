import Image from "next/image";
import Link from "next/link";

import highlightBg from "@/assets/RecentArticle/highlight.png";
import rectangleBackground from "@/assets/RecentArticle/rectangle-background.png";
import RevealOnScroll from "@/components/home/RevealOnScroll";
import WeeklyFunFact from "@/components/home/WeeklyFunFact";
import { createClient } from "@/lib/supabase/server";

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
  is_featured: boolean | null;
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

  const words = textContent
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(
    1,
    Math.ceil(words / 200),
  );
}

export default async function RecentArticles() {
  const supabase = await createClient();

  const {
    data: articles,
    error,
  } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      author_name,
      category,
      status,
      is_featured,
      published_at,
      created_at
    `)
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.warn("RECENT ARTICLES FETCH ERROR", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  const publishedArticles =
    ((articles ?? []) as Article[]).filter(
      (article) => !article.is_featured,
    );

  const shouldScroll =
    publishedArticles.length > 2;

  return (
    <section className="border-t border-[#27430D]/10 bg-[#F8F5EC]">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* Articles */}
          <div className="min-w-0">
            {/* Header */}
            <RevealOnScroll
              className="
                translate-y-8
                opacity-0
                transition-all
                duration-700
                ease-[cubic-bezier(0.22,1,0.36,1)]
                data-[visible=true]:translate-y-0
                data-[visible=true]:opacity-100
              "
            >
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold tracking-[0.25em] text-[#687704] sm:text-sm">
                    LATEST FROM THE COMPASS
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

                  <span aria-hidden="true">
                    ›
                  </span>
                </Link>
              </div>
            </RevealOnScroll>

            {/* Article Cards */}
            {publishedArticles.length > 0 ? (
              <div
                className={
                  shouldScroll
                    ? `
                        max-h-175
                        space-y-5
                        overflow-y-auto
                        overscroll-auto
                        pr-3
                        touch-pan-y

                        md:overscroll-contain

                        [scrollbar-color:#687704_transparent]
                        scrollbar-thin

                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-track]:bg-transparent

                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-[#687704]/35
                        [&::-webkit-scrollbar-thumb]:transition-colors

                        hover:[&::-webkit-scrollbar-thumb]:bg-[#687704]/65
                      `
                    : "space-y-5"
                }
              >
                {publishedArticles.map(
                  (article, index) => {
                    const publishedDate =
                      formatDate(
                        article.published_at ??
                          article.created_at,
                      );

                    const readingTime =
                      getReadingTime(
                        article.content,
                      );

                    return (
                      <RevealOnScroll
                        key={article.id}
                        className={`
                          translate-y-12
                          opacity-0
                          transition-all
                          duration-700
                          ease-[cubic-bezier(0.22,1,0.36,1)]
                          data-[visible=true]:translate-y-0
                          data-[visible=true]:opacity-100
                          ${
                            index === 1
                              ? "delay-150"
                              : ""
                          }
                        `}
                      >
                        <article className="group relative overflow-hidden">
                          {/* Background */}
                          <Image
                            src={
                              rectangleBackground
                            }
                            alt=""
                            fill
                            aria-hidden="true"
                            className="pointer-events-none select-none object-fill"
                            sizes="100vw"
                          />

                          <div className="relative z-10 grid gap-5 px-5 py-5 md:grid-cols-[48%_1fr] md:items-center md:px-7 md:py-6">
                            {/* Article Image */}
                            <div className="relative">
                              <Link
                                href={`/articles/${article.slug}`}
                                className="relative block min-h-56 overflow-hidden md:min-h-64"
                              >
                                {article.cover_image_url ? (
                                  <Image
                                    src={
                                      article.cover_image_url
                                    }
                                    alt={
                                      article.title
                                    }
                                    fill
                                    className="
                                      object-cover
                                      grayscale
                                      transition-all
                                      duration-700
                                      ease-[cubic-bezier(0.22,1,0.36,1)]
                                      group-hover:scale-[1.035]
                                      group-hover:grayscale-35
                                    "
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                  />
                                ) : (
                                  <div className="flex h-full min-h-56 w-full items-center justify-center bg-[#F8F5EC] md:min-h-64">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687704]/50">
                                      The Compass
                                    </p>
                                  </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-[#27430D]/10 transition-colors duration-700 group-hover:bg-transparent" />

                                {/* Shine */}
                                <div
                                  className="
                                    pointer-events-none
                                    absolute
                                    inset-y-0
                                    -left-1/2
                                    w-1/3
                                    -skew-x-12
                                    bg-white/10
                                    opacity-0
                                    blur-xl
                                    transition-all
                                    duration-700
                                    ease-out
                                    group-hover:left-[120%]
                                    group-hover:opacity-100
                                  "
                                />
                              </Link>

                              {/* Category */}
                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  left-4
                                  top-4
                                  z-20
                                  transition-transform
                                  duration-500
                                  ease-out
                                  group-hover:-translate-y-1
                                "
                              >
                                <div className="bg-white/95 px-3 py-1 text-xs font-medium text-[#27430D] shadow-sm">
                                  {article.category ||
                                    "Article"}
                                </div>
                              </div>
                            </div>

                            {/* Article Content */}
                            <div className="flex min-w-0 flex-col justify-center overflow-hidden">
                              <div
                                className="
                                  translate-y-4
                                  transition-transform
                                  duration-500
                                  ease-[cubic-bezier(0.22,1,0.36,1)]
                                  group-hover:translate-y-0
                                "
                              >
                                {/* Title */}
                                <Link
                                  href={`/articles/${article.slug}`}
                                >
                                  <h3
                                    className="
                                      max-w-2xl
                                      text-2xl
                                      font-bold
                                      leading-tight
                                      text-[#27430D]
                                      transition-colors
                                      duration-300
                                      group-hover:text-[#687704]
                                      sm:text-[28px]
                                    "
                                  >
                                    {
                                      article.title
                                    }
                                  </h3>
                                </Link>

                                {/* Excerpt */}
                                {article.excerpt && (
                                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7B886C]/80 sm:text-base">
                                    {
                                      article.excerpt
                                    }
                                  </p>
                                )}

                                {/* Highlight */}
                                <div className="mt-4 w-full">
                                  <div
                                    className="
                                      relative
                                      flex
                                      h-7
                                      w-full
                                      max-w-105
                                      items-center
                                      transition-transform
                                      duration-500
                                      ease-[cubic-bezier(0.22,1,0.36,1)]
                                      group-hover:-translate-y-0.5
                                    "
                                  >
                                    <Image
                                      src={
                                        highlightBg
                                      }
                                      alt=""
                                      fill
                                      aria-hidden="true"
                                      className="pointer-events-none select-none object-fill"
                                      sizes="420px"
                                    />

                                    <div className="relative z-10 flex h-full w-full items-center justify-between px-5 text-xs font-semibold text-white sm:text-sm">
                                      <span className="truncate pr-4">
                                        {article.author_name ||
                                          "The Compass"}
                                      </span>

                                      <span className="shrink-0">
                                        {
                                          readingTime
                                        }{" "}
                                        min read
                                      </span>
                                    </div>
                                  </div>

                                  {publishedDate && (
                                    <p className="mt-2 text-sm text-[#7B886C]/70">
                                      {
                                        publishedDate
                                      }
                                    </p>
                                  )}
                                </div>

                                {/* Read Article */}
                                <div className="mt-4 min-h-7 overflow-hidden">
                                  <Link
                                    href={`/articles/${article.slug}`}
                                    className="
                                      group/read
                                      pointer-events-none
                                      relative
                                      inline-flex
                                      translate-y-3
                                      items-center
                                      gap-3
                                      pb-1
                                      font-essays
                                      text-sm
                                      font-medium
                                      text-[#27430D]
                                      opacity-0
                                      transition-all
                                      duration-500
                                      ease-[cubic-bezier(0.22,1,0.36,1)]

                                      after:absolute
                                      after:bottom-0
                                      after:left-0
                                      after:h-px
                                      after:w-full
                                      after:origin-left
                                      after:scale-x-0
                                      after:bg-[#27430D]
                                      after:transition-transform
                                      after:duration-300
                                      after:ease-out

                                      group-hover:pointer-events-auto
                                      group-hover:translate-y-0
                                      group-hover:opacity-100

                                      hover:after:scale-x-100

                                      md:text-[17px]
                                    "
                                  >
                                    Read Article

                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="transition-transform duration-300 group-hover/read:translate-x-1.5"
                                      aria-hidden="true"
                                    >
                                      <path d="M5 12h14" />
                                      <path d="m12 5 7 7-7 7" />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </RevealOnScroll>
                    );
                  },
                )}
              </div>
            ) : (
              <RevealOnScroll
                className="
                  translate-y-10
                  opacity-0
                  transition-all
                  duration-700
                  data-[visible=true]:translate-y-0
                  data-[visible=true]:opacity-100
                "
              >
                <div className="border border-[#27430D]/10 bg-[#FEFEFE] px-6 py-12 text-center">
                  <p className="text-sm text-[#523A23]/50">
                    More articles are coming soon.
                  </p>
                </div>
              </RevealOnScroll>
            )}

            {/* Mobile View All */}
            <RevealOnScroll
              className="
                translate-y-6
                opacity-0
                transition-all
                delay-100
                duration-700
                data-[visible=true]:translate-y-0
                data-[visible=true]:opacity-100
              "
            >
              <Link
                href="/articles"
                className="mt-7 flex items-center justify-center gap-3 border border-[#27430D]/10 bg-[#FEFEFE] py-4 text-sm font-semibold text-[#27430D] sm:hidden"
              >
                View all articles

                <span aria-hidden="true">
                  ›
                </span>
              </Link>
            </RevealOnScroll>
          </div>

          {/* Weekly Fun Fact */}
          <WeeklyFunFact />
        </div>
      </div>
    </section>
  );
}