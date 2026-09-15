"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

const ARTICLE_IMAGE_BUCKET =
  "article-images";

const ALLOWED_COVER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_COVER_IMAGE_SIZE =
  10 * 1024 * 1024;

type ArticleStatus =
  | "draft"
  | "published";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/*
 * Generates a unique article slug
 * automatically from the title.
 *
 * Example:
 * Saving Money -> saving-money
 *
 * If it already exists:
 * Saving Money -> saving-money-2
 */
async function generateUniqueSlug(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  title: string,
) {
  const generatedSlug =
    slugify(title);

  const baseSlug =
    generatedSlug || "article";

  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to generate article URL: ${error.message}`,
      );
    }

    if (!data) {
      return slug;
    }

    slug =
      `${baseSlug}-${suffix}`;

    suffix += 1;
  }
}

/*
 * Rich text can contain HTML even when
 * it visually looks empty.
 */
function hasMeaningfulContent(
  html: string,
) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0;
}

/*
 * Authors arrive as multiple values.
 * Remove empty and duplicate names.
 */
function getAuthors(
  formData: FormData,
) {
  const submittedAuthors =
    formData
      .getAll("authors")
      .map((author) =>
        String(author)
          .trim()
          .replace(/\s+/g, " "),
      )
      .filter(Boolean);

  const uniqueAuthors: string[] =
    [];

  for (
    const author of
    submittedAuthors
  ) {
    const alreadyExists =
      uniqueAuthors.some(
        (existingAuthor) =>
          existingAuthor.toLowerCase() ===
          author.toLowerCase(),
      );

    if (!alreadyExists) {
      uniqueAuthors.push(author);
    }
  }

  return uniqueAuthors;
}

/*
 * Send server errors back to the editor.
 *
 * "attempt" lets the toast system know
 * whether saving a draft or publishing
 * was the operation that failed.
 */
function redirectWithError(
  message: string,
  status: ArticleStatus,
): never {
  const params =
    new URLSearchParams({
      error: message,
      attempt: status,
    });

  redirect(
    `/admin/articles/new?${params.toString()}`,
  );
}

export async function createArticle(
  formData: FormData,
) {
  const supabase =
    await createClient();

  /*
   * Only authenticated admins can
   * create an article.
   */
  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?redirectTo=/admin/articles/new",
    );
  }

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") ?? "",
  ).trim();

  const content = String(
    formData.get("content") ?? "",
  ).trim();

  const category = String(
    formData.get("category") ?? "",
  ).trim();

  const status: ArticleStatus =
    formData.get("status") ===
    "published"
      ? "published"
      : "draft";

  const authors =
    getAuthors(formData);

  /*
   * Every article field is required
   * before saving or publishing.
   */
  if (!title) {
    redirectWithError(
      "Please enter an article title.",
      status,
    );
  }

  if (!excerpt) {
    redirectWithError(
      "Please enter an article excerpt.",
      status,
    );
  }

  if (authors.length === 0) {
    redirectWithError(
      "Please add at least one author.",
      status,
    );
  }

  if (!category) {
    redirectWithError(
      "Please enter an article category.",
      status,
    );
  }

  if (
    !hasMeaningfulContent(content)
  ) {
    redirectWithError(
      "Please write some article content.",
      status,
    );
  }

  /*
   * Generate the slug automatically.
   */
  let slug: string;

  try {
    slug =
      await generateUniqueSlug(
        supabase,
        title,
      );
  } catch (error) {
    redirectWithError(
      error instanceof Error
        ? error.message
        : "Unable to generate the article URL.",
      status,
    );
  }

  const coverImage =
    formData.get("cover_image");

  if (
    !(coverImage instanceof File) ||
    coverImage.size === 0
  ) {
    redirectWithError(
      "Please upload a cover image.",
      status,
    );
  }

  if (
    !ALLOWED_COVER_IMAGE_TYPES.includes(
      coverImage.type,
    )
  ) {
    redirectWithError(
      "Cover image must be a JPG, PNG, or WebP file.",
      status,
    );
  }

  if (
    coverImage.size >
    MAX_COVER_IMAGE_SIZE
  ) {
    redirectWithError(
      "Cover image must be 10 MB or smaller.",
      status,
    );
  }

  let extension = "jpg";

  if (
    coverImage.type ===
    "image/png"
  ) {
    extension = "png";
  }

  if (
    coverImage.type ===
    "image/webp"
  ) {
    extension = "webp";
  }

  const coverPath =
    `covers/${crypto.randomUUID()}.${extension}`;

  /*
   * Upload cover image before inserting
   * the article so we can save its URL.
   */
  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .upload(
        coverPath,
        coverImage,
        {
          contentType:
            coverImage.type,
          upsert: false,
        },
      );

  if (uploadError) {
    redirectWithError(
      `Cover image upload failed: ${uploadError.message}`,
      status,
    );
  }

  const {
    data: publicUrlData,
  } =
    supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .getPublicUrl(
        coverPath,
      );

  const coverImageUrl =
    publicUrlData.publicUrl;

  if (!coverImageUrl) {
    await supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .remove([
        coverPath,
      ]);

    redirectWithError(
      "The cover image was uploaded, but its public URL could not be created.",
      status,
    );
  }

  const publishedAt =
    status === "published"
      ? new Date().toISOString()
      : null;

  const {
    error: insertError,
  } =
    await supabase
      .from("articles")
      .insert({
        title,
        slug,
        excerpt,
        content,
        category,
        cover_image_url:
          coverImageUrl,
        status,

        /*
         * Store every credited author.
         */
        authors,

        /*
         * Keep the first author in
         * the old column temporarily
         * for older site code.
         */
        author_name:
          authors[0],

        published_at:
          publishedAt,
      });

  if (insertError) {
    /*
     * Don't leave unused cover images
     * behind when the insert fails.
     */
    await supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .remove([
        coverPath,
      ]);

    redirectWithError(
      insertError.message,
      status,
    );
  }

  revalidatePath("/admin");
  revalidatePath(
    "/admin/articles",
  );
  revalidatePath("/");

  /*
   * Reaching this redirect means the
   * article was successfully inserted.
   *
   * The Articles layout will consume
   * the pending success notification.
   */
  redirect("/admin/articles");
}