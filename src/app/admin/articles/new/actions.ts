"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const ARTICLE_IMAGE_BUCKET = "article-images";

const ALLOWED_COVER_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_COVER_IMAGE_SIZE = 10 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Rich text can contain HTML even when it looks empty.
// This checks whether the editor contains actual readable content.
function hasMeaningfulContent(html: string) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0;
}

// Authors arrive as multiple form values.
// This removes empty entries and duplicate names before saving them.
function getAuthors(formData: FormData) {
  const submittedAuthors = formData
    .getAll("authors")
    .map((author) =>
      String(author)
        .trim()
        .replace(/\s+/g, " "),
    )
    .filter(Boolean);

  const uniqueAuthors: string[] = [];

  for (const author of submittedAuthors) {
    const alreadyExists = uniqueAuthors.some(
      (existingAuthor) =>
        existingAuthor.toLowerCase() === author.toLowerCase(),
    );

    if (!alreadyExists) {
      uniqueAuthors.push(author);
    }
  }

  return uniqueAuthors;
}

// Sending errors back through the URL lets the page display them
// without losing the normal server-action flow.
function redirectWithError(message: string): never {
  redirect(
    `/admin/articles/new?error=${encodeURIComponent(message)}`,
  );
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();

  // Make sure only an authenticated admin can create an article.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/articles/new");
  }

  const title = String(formData.get("title") ?? "").trim();
  const suppliedSlug = String(formData.get("slug") ?? "").trim();

  const slug = slugify(suppliedSlug || title);

  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  const status =
    formData.get("status") === "published"
      ? "published"
      : "draft";

  const authors = getAuthors(formData);

  // These checks are repeated on the server so the article
  // cannot bypass validation by disabling browser validation.
  if (!title) {
    redirectWithError("Please enter an article title.");
  }

  if (!slug) {
    redirectWithError("Please enter an article slug.");
  }

  if (!hasMeaningfulContent(content)) {
    redirectWithError("Please write some article content.");
  }

  // Drafts can be saved before credits are complete,
  // but a published article must identify at least one writer.
  if (status === "published" && authors.length === 0) {
    redirectWithError(
      "Please add at least one author before publishing.",
    );
  }

  const coverImage = formData.get("cover_image");

  // The Compass requires every article to have a cover image.
  if (
    !(coverImage instanceof File) ||
    coverImage.size === 0
  ) {
    redirectWithError("Please upload a cover image.");
  }

  if (
    !ALLOWED_COVER_IMAGE_TYPES.includes(coverImage.type)
  ) {
    redirectWithError(
      "Cover image must be a JPG, PNG, or WebP file.",
    );
  }

  if (coverImage.size > MAX_COVER_IMAGE_SIZE) {
    redirectWithError(
      "Cover image must be 10 MB or smaller.",
    );
  }

  let extension = "jpg";

  if (coverImage.type === "image/png") {
    extension = "png";
  }

  if (coverImage.type === "image/webp") {
    extension = "webp";
  }

  const coverPath =
    `covers/${crypto.randomUUID()}.${extension}`;

  // Upload the cover before creating the article so its public URL
  // can be stored with the article record.
  const { error: uploadError } = await supabase.storage
    .from(ARTICLE_IMAGE_BUCKET)
    .upload(coverPath, coverImage, {
      contentType: coverImage.type,
      upsert: false,
    });

  if (uploadError) {
    redirectWithError(
      `Cover image upload failed: ${uploadError.message}`,
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(ARTICLE_IMAGE_BUCKET)
    .getPublicUrl(coverPath);

  const coverImageUrl = publicUrlData.publicUrl;

  if (!coverImageUrl) {
    await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .remove([coverPath]);

    redirectWithError(
      "The cover image was uploaded, but its public URL could not be created.",
    );
  }

  const publishedAt =
    status === "published"
      ? new Date().toISOString()
      : null;

  const { error: insertError } = await supabase
    .from("articles")
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category: category || null,
      cover_image_url: coverImageUrl,
      status,

      // The new array stores every writer credited on the article.
      authors,

      // Keep the first author in the old column temporarily.
      // This prevents older parts of the site from breaking while
      // they are being migrated to the new authors array.
      author_name: authors[0] ?? null,

      published_at: publishedAt,
    });

  if (insertError) {
    // If the database insert fails, remove the uploaded image
    // so an unused file is not left behind in Storage.
    await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .remove([coverPath]);

    redirectWithError(insertError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/");

  redirect("/admin/articles");
}