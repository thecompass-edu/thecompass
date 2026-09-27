"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sanitizeArticleHtml } from "@/lib/security/sanitizeArticleHtml";
import { createClient } from "@/lib/supabase/server";

const ARTICLE_IMAGE_BUCKET = "article-images";

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

// Create a unique slug from the article title.
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

// Check if the rich text actually contains content.
function hasMeaningfulContent(
  html: string,
) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0;
}

// Clean up author names and remove duplicates.
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

// Send the user back to the editor with an error.
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

  // Make sure the user is logged in.
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/login?redirectTo=/admin/articles/new",
    );
  }

  // Make sure the logged-in user is an admin.
  const {
    data: adminAccess,
    error: adminAccessError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    adminAccessError ||
    !adminAccess
  ) {
    if (adminAccessError) {
      console.error(
        "CREATE ARTICLE ADMIN AUTHORIZATION ERROR:",
        adminAccessError,
      );
    }

    redirect("/");
  }

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") ?? "",
  ).trim();

  const rawContent = String(
    formData.get("content") ?? "",
  ).trim();

  // Sanitize the article HTML before saving it.
  const content =
    sanitizeArticleHtml(
      rawContent,
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

  // Validate required fields.
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

  // Generate the article URL.
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

  // Validate the cover image.
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

  // Upload the cover image.
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

  // Save the article.
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
        authors,

        // Keep this for older parts of the site.
        author_name:
          authors[0],

        published_at:
          publishedAt,
      });

  if (insertError) {
    // Remove the uploaded image if saving fails.
    await supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .remove([
        coverPath,
      ]);

    console.error(
      "CREATE ARTICLE INSERT ERROR:",
      insertError,
    );

    redirectWithError(
      "Unable to save the article. Please try again.",
      status,
    );
  }

  // Refresh pages that use article data.
  revalidatePath("/admin");
  revalidatePath(
    "/admin/articles",
  );
  revalidatePath("/");

  redirect("/admin/articles");
}