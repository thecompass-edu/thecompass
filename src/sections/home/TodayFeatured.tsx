import Image from "next/image";
import Link from "next/link";

import TodayFeaturedImage from "@/assets/TodayFeatured/Today_Featured.png";
import MainCard from "@/assets/TodayFeatured/Main_Card.png";
import MaincardMobile from "@/assets/TodayFeatured/Main_Card_Mobile.png";
import HighlightCard from "@/assets/TodayFeatured/Highlight_Card.png";

import RevealOnScroll from "@/components/home/RevealOnScroll";
import { createClient } from "@/lib/supabase/server";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
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

  const words = textContent.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export const TodayFeatured = async () => {
  const supabase = await createClient();

  const { data: featuredArticle, error: featuredError } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image_url,
        category,
        status,
        is_featured,
        published_at,
        created_at
      `,
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(1)
    .maybeSingle<Article>();

  if (featuredError) {
    console.error("FEATURED ARTICLE FETCH ERROR:", featuredError);
  }

  let article = featuredArticle;

  if (!article) {
    const { data: latestArticle, error: latestError } = await supabase
      .from("articles")
      .select(
        `
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image_url,
          category,
          status,
          is_featured,
          published_at,
          created_at
        `,
      )
      .eq("status", "published")
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .limit(1)
      .maybeSingle<Article>();

    if (latestError) {
      console.error("LATEST ARTICLE FETCH ERROR:", latestError);
    }

    article = latestArticle;
  }

  if (!article) {
    return null;
  }

  const publishedDate = formatDate(article.published_at ?? article.created_at);
  const readingTime = getReadingTime(article.content);

  return (
    <section className="w-full overflow-hidden bg-[#F8F5EC] px-0 py-14 md:px-8 md:py-20">
      <RevealOnScroll className="featured-reveal group relative mx-auto w-full max-w-295">
        {/* Torn Paper Background */}
        <div className="featured-background-enter pointer-events-none absolute inset-0 z-0">
          <Image
            src={MaincardMobile}
            alt=""
            fill
            priority
            className="object-fill md:hidden"
            sizes="(max-width: 768px) 100vw, 0vw"
          />

          <Image
            src={MainCard}
            alt=""
            fill
            priority
            className="hidden object-fill md:block"
            sizes="(max-width: 768px) 0vw, 100vw"
          />
        </div>

        {/* Main Card */}
        <div className="relative z-10 flex flex-col gap-5 p-6 md:flex-row md:gap-10 md:p-10 lg:p-12">
          {/* Mobile Label */}
          <p className="featured-label-enter text-xs font-essays uppercase tracking-[0.18em] text-white/80 md:hidden">
            Today&apos;s Featured Read
          </p>

          {/* Left Image */}
          <div className="featured-image-enter relative h-52 w-full overflow-visible md:h-auto md:min-h-107.5 md:w-[57%]">
            {/* Category Paper */}
            <div className="absolute -left-8 top-4 z-30 md:-left-14 md:top-8">
              <div className="featured-category-enter">
                <div className="relative flex min-w-50 items-center justify-center px-7 py-3 md:min-w-82.5 md:px-10 md:py-3.5">
                  <div className="absolute inset-0">
                    <Image
                      src={HighlightCard}
                      alt=""
                      fill
                      className="object-fill"
                      sizes="390px"
                    />
                  </div>

                  <span className="relative z-10 text-center text-sm font-medium font-essays text-[#354E27] md:text-base">
                    {article.category || "Financial Literacy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <Link
              href={`/articles/${article.slug}`}
              className="relative block h-full w-full overflow-hidden"
            >
              <Image
                src={article.cover_image_url || TodayFeaturedImage}
                alt={article.title}
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
                sizes="(max-width: 768px) 100vw, 57vw"
              />

              <div className="absolute inset-0 bg-[#27430D]/10 transition-colors duration-700 group-hover:bg-transparent" />

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
          </div>

          {/* Right Content */}
          <div className="featured-content-enter w-full md:w-[43%]">
            <div
              className="
                flex
                h-full
                w-full
                flex-col
                justify-center
                transition-transform
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                md:group-hover:-translate-y-1
              "
            >
              <p className="hidden text-[14px] font-essays uppercase tracking-[0.2em] text-white/75 md:block">
                Today&apos;s Featured Read
              </p>

              <Link href={`/articles/${article.slug}`}>
                <h2
                  className="
                    mt-4
                    max-w-xl
                    text-[29px]
                    font-medium
                    leading-[1.08]
                    font-essays
                    text-white
                    transition-opacity
                    duration-300
                    hover:opacity-80
                    md:mt-5
                    md:text-[42px]
                    lg:text-[46px]
                  "
                >
                  {article.title}
                </h2>
              </Link>

              {article.excerpt && (
                <p className="mt-5 max-w-lg text-[16px] leading-7 font-essays text-[#AAB79B] md:text-[19px] md:leading-8">
                  {article.excerpt}
                </p>
              )}

              <div className="mt-6 flex items-center gap-3 text-sm font-essays text-white/55 md:text-[15px]">
                <span>{publishedDate}</span>
                <span aria-hidden="true">·</span>
                <span>{readingTime} min read</span>
              </div>

              {/* Read Article */}
              <div className="mt-8 flex min-h-8.5 justify-start">
                <Link
                  href={`/articles/${article.slug}`}
                  className="
                    group/read
                    relative
                    inline-flex
                    translate-y-0
                    items-center
                    gap-3
                    pb-1
                    text-[16px]
                    font-medium
                    font-essays
                    text-white
                    opacity-100
                    pointer-events-auto
                    transition-all
                    duration-300
                    ease-out

                    md:translate-y-2
                    md:opacity-0
                    md:pointer-events-none
                    md:group-hover:translate-y-0
                    md:group-hover:opacity-100
                    md:group-hover:pointer-events-auto
                    md:text-[18px]
                  "
                >
                  <span>Read Article</span>

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

                  <span
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-px
                      w-full
                      origin-left
                      scale-x-0
                      bg-white
                      transition-transform
                      duration-300
                      ease-out
                      group-hover/read:scale-x-100
                    "
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Entrance Animations */}
        <style>{`
          .featured-background-enter {
            opacity: 0;
            transform: translateY(26px);
            transition:
              opacity 900ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .featured-reveal[data-visible="true"] .featured-background-enter {
            opacity: 1;
            transform: translateY(0);
          }

          .featured-image-enter {
            opacity: 0;
            transform: translateX(-38px);
            transition:
              opacity 900ms cubic-bezier(0.22, 1, 0.36, 1) 120ms,
              transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 120ms;
          }

          .featured-reveal[data-visible="true"] .featured-image-enter {
            opacity: 1;
            transform: translateX(0);
          }

          .featured-content-enter {
            opacity: 0;
            transform: translateX(38px);
            transition:
              opacity 900ms cubic-bezier(0.22, 1, 0.36, 1) 220ms,
              transform 900ms cubic-bezier(0.22, 1, 0.36, 1) 220ms;
          }

          .featured-reveal[data-visible="true"] .featured-content-enter {
            opacity: 1;
            transform: translateX(0);
          }

          .featured-category-enter {
            opacity: 0;
            transform: translateY(-12px) scale(0.96);
            transition:
              opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) 420ms,
              transform 700ms cubic-bezier(0.22, 1, 0.36, 1) 420ms;
          }

          .featured-reveal[data-visible="true"] .featured-category-enter {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          .featured-label-enter {
            opacity: 0;
            transform: translateY(10px);
            transition:
              opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) 180ms,
              transform 700ms cubic-bezier(0.22, 1, 0.36, 1) 180ms;
          }

          .featured-reveal[data-visible="true"] .featured-label-enter {
            opacity: 1;
            transform: translateY(0);
          }

          @media (prefers-reduced-motion: reduce) {
            .featured-background-enter,
            .featured-image-enter,
            .featured-content-enter,
            .featured-category-enter,
            .featured-label-enter {
              opacity: 1;
              transform: none;
              transition: none;
            }
          }
        `}</style>
      </RevealOnScroll>
    </section>
  );
};