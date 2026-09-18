import Link from "next/link";
import { notFound } from "next/navigation";

import ArticleViewTracker from "@/components/analytics/ArticleViewTracker";
import Navbar from "@/components/home/Navbar";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    month: "long",
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

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: article, error } = await supabase
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
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<Article>();

  if (error) {
    console.error("PUBLIC ARTICLE FETCH ERROR:", error);
  }

  if (error || !article) {
    notFound();
  }

  const publishedDate = formatDate(
    article.published_at ?? article.created_at,
  );

  const readingTime = getReadingTime(article.content);

  return (
    <main className="min-h-screen bg-white text-[#27430D]">
      {/* Record article view */}
      <ArticleViewTracker articleId={article.id} />

      <Navbar />

      <article className="mx-auto w-full max-w-[1120px] px-5 pb-16 pt-12 sm:px-8 lg:px-10 lg:pb-20 lg:pt-16">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-8 max-w-4xl"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[#523A23]/50">
            <li>
              <Link
                href="/articles"
                className="font-semibold text-[#687704] transition-colors duration-200 hover:text-[#27430D]"
              >
                Articles
              </Link>
            </li>

            {article.category && (
              <>
                <li
                  aria-hidden="true"
                  className="text-[#523A23]/30"
                >
                  /
                </li>

                <li className="text-[#523A23]/55">
                  {article.category}
                </li>
              </>
            )}

            <li
              aria-hidden="true"
              className="text-[#523A23]/30"
            >
              /
            </li>

            <li
              className="max-w-[320px] truncate font-medium text-[#27430D]/70"
              title={article.title}
            >
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mx-auto max-w-4xl text-left">
          {article.category && (
            <p className="mb-4 text-[15px] font-semibold uppercase tracking-[0.16em] text-[#687704]">
              {article.category}
            </p>
          )}

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#27430D] sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-6 max-w-3xl text-xl leading-9 text-[#523A23]/70 sm:text-[22px]">
              {article.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-start gap-x-3 gap-y-2 text-[15px] text-[#523A23]/55">
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
        </header>

        {/* Divider */}
        <div className="mx-auto my-10 max-w-4xl border-t border-[#27430D]/15" />

        {/* Article Content */}
        <div
          className="
            mx-auto max-w-4xl
            text-[19px] leading-9 text-[#3F4539]

            [&_p]:mb-7

            [&_h1]:mb-5
            [&_h1]:mt-12
            [&_h1]:text-[42px]
            [&_h1]:font-semibold
            [&_h1]:leading-tight
            [&_h1]:text-[#27430D]

            [&_h2]:mb-4
            [&_h2]:mt-11
            [&_h2]:text-[32px]
            [&_h2]:font-semibold
            [&_h2]:leading-tight
            [&_h2]:text-[#27430D]

            [&_h3]:mb-3
            [&_h3]:mt-9
            [&_h3]:text-[25px]
            [&_h3]:font-semibold
            [&_h3]:leading-tight
            [&_h3]:text-[#27430D]

            [&_strong]:font-semibold
            [&_strong]:text-[#27430D]

            [&_em]:italic

            [&_ul]:mb-7
            [&_ul]:list-disc
            [&_ul]:space-y-2
            [&_ul]:pl-7

            [&_ol]:mb-7
            [&_ol]:list-decimal
            [&_ol]:space-y-2
            [&_ol]:pl-7

            [&_li]:pl-1

            [&_blockquote]:my-9
            [&_blockquote]:border-l-4
            [&_blockquote]:border-[#687704]
            [&_blockquote]:pl-6
            [&_blockquote]:italic
            [&_blockquote]:text-[#523A23]/70

            [&_a]:font-medium
            [&_a]:text-[#687704]
            [&_a]:underline
            [&_a]:underline-offset-4
            [&_a]:transition-colors
            [&_a]:duration-200
            hover:[&_a]:text-[#27430D]

            [&_img]:mx-auto
            [&_img]:my-9
            [&_img]:block
            [&_img]:h-auto
            [&_img]:max-w-full
            [&_img]:rounded-2xl

            [&_hr]:my-10
            [&_hr]:border-[#27430D]/10
          "
          dangerouslySetInnerHTML={{
            __html: article.content,
          }}
        />
      </article>
    </main>
  );
}