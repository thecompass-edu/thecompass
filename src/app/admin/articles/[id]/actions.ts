"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getStoragePathFromUrl(url: string | null) {
  if (!url) return null;

  const marker = "/storage/v1/object/public/article-images/";

  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    url.substring(markerIndex + marker.length),
  );
}

export async function updateArticle(
  articleId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const customSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const authorName = String(formData.get("author_name") ?? "").trim();

  const currentCoverImageUrl = String(
    formData.get("current_cover_image_url") ?? "",
  ).trim();

  const removeCoverImage =
    formData.get("remove_cover_image") === "true";

  const newCoverImage = formData.get("cover_image");

  const status =
    formData.get("status") === "published"
      ? "published"
      : "draft";

  const isFeatured = formData.get("is_featured") === "on";

  if (!title) {
    redirect(
      `/admin/articles/${articleId}?error=${encodeURIComponent(
        "Article title is required.",
      )}`,
    );
  }

  const slug = slugify(customSlug || title);

  const { data: existingArticle, error: fetchError } = await supabase
    .from("articles")
    .select("published_at, cover_image_url")
    .eq("id", articleId)
    .single();

  if (fetchError || !existingArticle) {
    redirect(
      `/admin/articles/${articleId}?error=${encodeURIComponent(
        "Could not load the article.",
      )}`,
    );
  }

  let coverImageUrl =
    currentCoverImageUrl ||
    existingArticle.cover_image_url ||
    null;

  /*
   * REMOVE CURRENT IMAGE
   */
  if (removeCoverImage) {
    await removeCoverImageFromStorage(
      supabase,
      existingArticle.cover_image_url,
    );

    coverImageUrl = null;
  }

  /*
   * UPLOAD NEW IMAGE
   */
  if (
    newCoverImage instanceof File &&
    newCoverImage.size > 0
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(newCoverImage.type)) {
      redirect(
        `/admin/articles/${articleId}?error=${encodeURIComponent(
          "Please upload a JPG, PNG, or WEBP image.",
        )}`,
      );
    }

    const extension =
      newCoverImage.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `covers/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, newCoverImage, {
        contentType: newCoverImage.type,
        upsert: false,
      });

    if (uploadError) {
      redirect(
        `/admin/articles/${articleId}?error=${encodeURIComponent(
          `Image upload failed: ${uploadError.message}`,
        )}`,
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    /*
     * Delete previous image only after the new upload succeeds.
     */
    if (existingArticle.cover_image_url) {
      await removeCoverImageFromStorage(
        supabase,
        existingArticle.cover_image_url,
      );
    }

    coverImageUrl = publicUrlData.publicUrl;
  }

  const publishedAt =
    status === "published"
      ? existingArticle.published_at ?? new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      category: category || null,
      author_name: authorName || null,
      cover_image_url: coverImageUrl,
      status,
      is_featured: isFeatured,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) {
    redirect(
      `/admin/articles/${articleId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${articleId}`);

  redirect("/admin/articles");
}

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("cover_image_url")
    .eq("id", articleId)
    .single();

  if (article?.cover_image_url) {
    await removeCoverImageFromStorage(
      supabase,
      article.cover_image_url,
    );
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) {
    redirect(
      `/admin/articles/${articleId}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");

  redirect("/admin/articles");
}

async function removeCoverImageFromStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imageUrl: string | null,
) {
  const path = getStoragePathFromUrl(imageUrl);

  if (!path) return;

  const { error } = await supabase.storage
    .from("article-images")
    .remove([path]);

  if (error) {
    console.error("Storage cleanup failed:", error);
  }
}