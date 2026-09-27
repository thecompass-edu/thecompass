"use client";

import { deleteFunFact } from "@/app/admin/fun-facts/actions";

type DeleteFunFactButtonProps = {
  id: string;
  title?: string;
};

export default function DeleteFunFactButton({
  id,
  title,
}: DeleteFunFactButtonProps) {
  const deleteAction = deleteFunFact.bind(null, id);

  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          title
            ? `Delete "${title}"? This action cannot be undone.`
            : "Delete this fun fact? This action cannot be undone.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="
          inline-flex
          items-center
          justify-center
          rounded-lg
          border
          border-red-200
          px-3
          py-2
          text-sm
          font-semibold
          text-red-600
          transition
          hover:border-red-300
          hover:bg-red-50
        "
      >
        Delete
      </button>
    </form>
  );
}