"use client";

import { useState, useTransition } from "react";

import { deleteArticle } from "@/app/admin/articles/actions";

type DeleteArticleButtonProps = {
  articleId: string;
  articleTitle: string;
};

export default function DeleteArticleButton({
  articleId,
  articleTitle,
}: DeleteArticleButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        await deleteArticle(articleId);
      } catch {
        setError("Failed to delete article.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}