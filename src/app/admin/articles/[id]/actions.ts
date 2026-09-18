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

type SupabaseClient = Awaited<
  ReturnType<typeof createClient>
>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getStoragePathFromUrl(
  url: string | null,
) {
  if (!url) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/article-images/";

  const markerIndex =
    url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(
    url.substring(
      markerIndex + marker.length,
    ),
  );
}

function hasMeaningfulContent(
  html: string,
) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0;
}

// Make sure the current user is an admin.
async function requireAdmin(
  supabase: SupabaseClient,
  redirectTo: string,
) {
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/login?redirectTo=${encodeURIComponent(
        redirectTo,
      )}`,
    );
  }

  const {
    data: adminAccess,
    error: adminError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "ADMIN AUTHORIZATION ERROR:",
      adminError,
    );

    redirect("/");
  }

  if (!adminAccess) {
    redirect("/");
  }

  return user;
}

function redirectWithError(
  articleId: string,
  message: string,
): never {
  redirect(
    `/admin/articles/${articleId}?error=${encodeURIComponent(
      message,
    )}`,
  );
}

export async function updateArticle(
  articleId: string,
  formData: FormData,
) {
  const supabase =
    await createClient();

  await requireAdmin(
    supabase,
    `/admin/articles/${articleId}`,
  );

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const customSlug = String(
    formData.get("slug") ?? "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") ?? "",
  ).trim();

  const rawContent = String(
    formData.get("content") ?? "",
  ).trim();

  // Clean the article HTML before saving it.
  const content =
    sanitizeArticleHtml(
      rawContent,
    ).trim();

  const category = String(
    formData.get("category") ?? "",
  ).trim();

  const authorName = String(
    formData.get("author_name") ?? "",
  ).trim();

  const removeCoverImage =
    formData.get(
      "remove_cover_image",
    ) === "true";

  const newCoverImage =
    formData.get("cover_image");

  const status =
    formData.get("status") ===
    "published"
      ? "published"
      : "draft";

  const isFeatured =
    formData.get("is_featured") ===
    "on";

  if (!title) {
    redirectWithError(
      articleId,
      "Article title is required.",
    );
  }

  if (
    !hasMeaningfulContent(content)
  ) {
    redirectWithError(
      articleId,
      "Please write some article content.",
    );
  }

  const slug =
    slugify(
      customSlug || title,
    ) || "article";

  // Make sure another article is not using this slug.
  const {
    data: articleWithSameSlug,
    error: slugCheckError,
  } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .neq("id", articleId)
    .maybeSingle();

  if (slugCheckError) {
    console.error(
      "ARTICLE SLUG CHECK ERROR:",
      slugCheckError,
    );

    redirectWithError(
      articleId,
      "Unable to check the article URL. Please try again.",
    );
  }

  if (articleWithSameSlug) {
    redirectWithError(
      articleId,
      "Another article is already using this URL.",
    );
  }

  const {
    data: existingArticle,
    error: fetchError,
  } = await supabase
    .from("articles")
    .select(
      "published_at, cover_image_url",
    )
    .eq("id", articleId)
    .single();

  if (
    fetchError ||
    !existingArticle
  ) {
    if (fetchError) {
      console.error(
        "ARTICLE FETCH ERROR:",
        fetchError,
      );
    }

    redirectWithError(
      articleId,
      "Could not load the article.",
    );
  }

  let coverImageUrl =
    existingArticle.cover_image_url ??
    null;

  let newCoverPath:
    | string
    | null = null;

  // Remove the current image from the article.
  if (removeCoverImage) {
    coverImageUrl = null;
  }

  // Upload a replacement image if one was provided.
  if (
    newCoverImage instanceof File &&
    newCoverImage.size > 0
  ) {
    if (
      !ALLOWED_COVER_IMAGE_TYPES.includes(
        newCoverImage.type,
      )
    ) {
      redirectWithError(
        articleId,
        "Please upload a JPG, PNG, or WebP image.",
      );
    }

    if (
      newCoverImage.size >
      MAX_COVER_IMAGE_SIZE
    ) {
      redirectWithError(
        articleId,
        "Cover image must be 10 MB or smaller.",
      );
    }

    let extension = "jpg";

    if (
      newCoverImage.type ===
      "image/png"
    ) {
      extension = "png";
    }

    if (
      newCoverImage.type ===
      "image/webp"
    ) {
      extension = "webp";
    }

    newCoverPath =
      `covers/${crypto.randomUUID()}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .upload(
        newCoverPath,
        newCoverImage,
        {
          contentType:
            newCoverImage.type,
          upsert: false,
        },
      );

    if (uploadError) {
      console.error(
        "ARTICLE IMAGE UPLOAD ERROR:",
        uploadError,
      );

      redirectWithError(
        articleId,
        "Image upload failed. Please try again.",
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(
        ARTICLE_IMAGE_BUCKET,
      )
      .getPublicUrl(
        newCoverPath,
      );

    if (
      !publicUrlData.publicUrl
    ) {
      await supabase.storage
        .from(
          ARTICLE_IMAGE_BUCKET,
        )
        .remove([
          newCoverPath,
        ]);

      redirectWithError(
        articleId,
        "The image was uploaded, but its URL could not be created.",
      );
    }

    coverImageUrl =
      publicUrlData.publicUrl;
  }

  const publishedAt =
    status === "published"
      ? existingArticle.published_at ??
        new Date().toISOString()
      : null;

  const {
    error: updateError,
  } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category:
        category || null,
      author_name:
        authorName || null,
      cover_image_url:
        coverImageUrl,
      status,
      is_featured:
        isFeatured,
      published_at:
        publishedAt,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", articleId);

  if (updateError) {
    // Remove the new upload if the article update fails.
    if (newCoverPath) {
      await supabase.storage
        .from(
          ARTICLE_IMAGE_BUCKET,
        )
        .remove([
          newCoverPath,
        ]);
    }

    console.error(
      "ARTICLE UPDATE ERROR:",
      updateError,
    );

    redirectWithError(
      articleId,
      "Unable to update the article. Please try again.",
    );
  }

  // Clean up the old image after the article saves.
  const coverChanged =
    removeCoverImage ||
    newCoverPath !== null;

  if (
    coverChanged &&
    existingArticle.cover_image_url
  ) {
    await removeCoverImageFromStorage(
      supabase,
      existingArticle.cover_image_url,
    );
  }

  revalidatePath("/admin");
  revalidatePath(
    "/admin/articles",
  );
  revalidatePath(
    `/admin/articles/${articleId}`,
  );
  revalidatePath(
    `/articles/${slug}`,
  );
  revalidatePath("/");

  redirect("/admin/articles");
}

export async function deleteArticle(
  articleId: string,
) {
  const supabase =
    await createClient();

  await requireAdmin(
    supabase,
    `/admin/articles/${articleId}`,
  );

  const {
    data: article,
    error: fetchError,
  } = await supabase
    .from("articles")
    .select(
      "cover_image_url, slug",
    )
    .eq("id", articleId)
    .single();

  if (
    fetchError ||
    !article
  ) {
    if (fetchError) {
      console.error(
        "DELETE ARTICLE FETCH ERROR:",
        fetchError,
      );
    }

    redirectWithError(
      articleId,
      "Could not load the article.",
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (deleteError) {
    console.error(
      "ARTICLE DELETE ERROR:",
      deleteError,
    );

    redirectWithError(
      articleId,
      "Unable to delete the article. Please try again.",
    );
  }

  // Delete the image only after the article is gone.
  if (
    article.cover_image_url
  ) {
    await removeCoverImageFromStorage(
      supabase,
      article.cover_image_url,
    );
  }

  revalidatePath("/admin");
  revalidatePath(
    "/admin/articles",
  );
  revalidatePath(
    `/articles/${article.slug}`,
  );
  revalidatePath("/");

  redirect("/admin/articles");
}

async function removeCoverImageFromStorage(
  supabase: SupabaseClient,
  imageUrl: string | null,
) {
  const path =
    getStoragePathFromUrl(
      imageUrl,
    );

  if (!path) {
    return;
  }

  const {
    error,
  } = await supabase.storage
    .from(
      ARTICLE_IMAGE_BUCKET,
    )
    .remove([
      path,
    ]);

  if (error) {
    console.error(
      "Storage cleanup failed:",
      error,
    );
  }
}