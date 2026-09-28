"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) {
    console.error("Failed to delete article:", error);
    throw new Error("Failed to delete article.");
  }

  revalidatePath("/admin/articles");
}