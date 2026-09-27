"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "fun-facts";

function getString(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getStoragePathFromPublicUrl(
  imageUrl: string | null,
) {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    const marker =
      `/storage/v1/object/public/${STORAGE_BUCKET}/`;

    const markerIndex =
      url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const encodedPath =
      url.pathname.slice(
        markerIndex + marker.length,
      );

    if (!encodedPath) {
      return null;
    }

    return decodeURIComponent(
      encodedPath,
    );
  } catch {
    return null;
  }
}

async function deleteImageFromStorage(
  imageUrl: string | null,
) {
  const filePath =
    getStoragePathFromPublicUrl(
      imageUrl,
    );

  if (!filePath) {
    return;
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

  if (error) {
    console.error(
      "FUN FACT STORAGE DELETE ERROR:",
      error,
    );
  }
}

export async function createFunFact(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const title = getString(
    formData,
    "title",
  );

  const description = getString(
    formData,
    "description",
  );

  const numberValue = getString(
    formData,
    "fun_fact_number",
  );

  const imageUrl = getString(
    formData,
    "image_url",
  );

  const status = getString(
    formData,
    "status",
  );

  const imageUploading = getString(
    formData,
    "image_uploading",
  );

  if (imageUploading === "true") {
    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        "Please wait for the image to finish uploading.",
      )}`,
    );
  }

  if (!title) {
    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        "Title is required.",
      )}`,
    );
  }

  if (!description) {
    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        "Description is required.",
      )}`,
    );
  }

  const funFactNumber =
    Number(numberValue);

  if (
    !Number.isInteger(
      funFactNumber,
    ) ||
    funFactNumber < 1
  ) {
    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        "Weekly Fun Fact number must be a positive whole number.",
      )}`,
    );
  }

  const validStatus =
    status === "published"
      ? "published"
      : "draft";

  if (
    validStatus ===
      "published" &&
    !imageUrl
  ) {
    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        "Add an image before publishing.",
      )}`,
    );
  }

  const { error } =
    await supabase
      .from("fun_facts")
      .insert({
        title,
        description,
        fun_fact_number:
          funFactNumber,
        image_url:
          imageUrl || null,
        status:
          validStatus,
        published_at:
          validStatus ===
          "published"
            ? new Date().toISOString()
            : null,
      });

  if (error) {
    console.error(
      "CREATE FUN FACT ERROR:",
      error,
    );

    redirect(
      `/admin/fun-facts/new?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath(
    "/admin/fun-facts",
  );
  revalidatePath("/");

  redirect(
    "/admin/fun-facts",
  );
}

export async function updateFunFact(
  id: string,
  formData: FormData,
) {
  const supabase =
    await createClient();

  const title = getString(
    formData,
    "title",
  );

  const description = getString(
    formData,
    "description",
  );

  const numberValue = getString(
    formData,
    "fun_fact_number",
  );

  const imageUrl = getString(
    formData,
    "image_url",
  );

  const status = getString(
    formData,
    "status",
  );

  const imageUploading = getString(
    formData,
    "image_uploading",
  );

  if (imageUploading === "true") {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        "Please wait for the image to finish uploading.",
      )}`,
    );
  }

  if (!title) {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        "Title is required.",
      )}`,
    );
  }

  if (!description) {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        "Description is required.",
      )}`,
    );
  }

  const funFactNumber =
    Number(numberValue);

  if (
    !Number.isInteger(
      funFactNumber,
    ) ||
    funFactNumber < 1
  ) {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        "Weekly Fun Fact number must be a positive whole number.",
      )}`,
    );
  }

  const validStatus =
    status === "published"
      ? "published"
      : "draft";

  if (
    validStatus ===
      "published" &&
    !imageUrl
  ) {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        "Add an image before publishing.",
      )}`,
    );
  }

  const {
    data: existingFunFact,
    error: fetchError,
  } = await supabase
    .from("fun_facts")
    .select(
      "image_url, published_at",
    )
    .eq("id", id)
    .single();

  if (fetchError) {
    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        fetchError.message,
      )}`,
    );
  }

  const publishedAt =
    validStatus ===
    "published"
      ? existingFunFact
          .published_at ??
        new Date().toISOString()
      : null;

  const { error } =
    await supabase
      .from("fun_facts")
      .update({
        title,
        description,
        fun_fact_number:
          funFactNumber,
        image_url:
          imageUrl || null,
        status:
          validStatus,
        published_at:
          publishedAt,
      })
      .eq("id", id);

  if (error) {
    console.error(
      "UPDATE FUN FACT ERROR:",
      error,
    );

    redirect(
      `/admin/fun-facts/${id}?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  if (
    existingFunFact.image_url &&
    existingFunFact.image_url !==
      imageUrl
  ) {
    await deleteImageFromStorage(
      existingFunFact.image_url,
    );
  }

  revalidatePath("/admin");

  revalidatePath(
    "/admin/fun-facts",
  );

  revalidatePath(
    `/admin/fun-facts/${id}`,
  );

  revalidatePath("/");

  redirect(
    "/admin/fun-facts",
  );
}

export async function deleteFunFact(
  id: string,
) {
  const supabase =
    await createClient();

  const { data: funFact } =
    await supabase
      .from("fun_facts")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

  const { error } =
    await supabase
      .from("fun_facts")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      "DELETE FUN FACT ERROR:",
      error,
    );

    return;
  }

  if (funFact?.image_url) {
    await deleteImageFromStorage(
      funFact.image_url,
    );
  }

  revalidatePath("/admin");

  revalidatePath(
    "/admin/fun-facts",
  );

  revalidatePath("/");
}