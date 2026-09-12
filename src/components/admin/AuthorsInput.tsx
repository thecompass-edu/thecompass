"use client";

import { KeyboardEvent, useState } from "react";

type AuthorsInputProps = {
  initialAuthors?: string[];
};

export default function AuthorsInput({
  initialAuthors = [],
}: AuthorsInputProps) {
  const [authors, setAuthors] = useState<string[]>(initialAuthors);
  const [authorInput, setAuthorInput] = useState("");

  // Adds a name only if it is not empty and has not already been added.
  function addAuthor(value = authorInput) {
    const name = value.trim().replace(/\s+/g, " ");

    if (!name) {
      return;
    }

    const alreadyExists = authors.some(
      (author) => author.toLowerCase() === name.toLowerCase(),
    );

    if (!alreadyExists) {
      setAuthors((current) => [...current, name]);
    }

    setAuthorInput("");
  }

  // Enter and comma both finish the current author name.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAuthor();
    }
  }

  // Removes one author without affecting the others.
  function removeAuthor(name: string) {
    setAuthors((current) =>
      current.filter((author) => author !== name),
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="author-name"
          className="text-sm font-semibold text-[#27430D]"
        >
          Authors{" "}
          <span
            aria-hidden="true"
            className="text-red-500"
          >
            *
          </span>
        </label>

        <span className="text-xs text-[#523A23]/35">
          Required to publish
        </span>
      </div>

      {/* Each added author is submitted as part of the form. */}
      {authors.map((author) => (
        <input
          key={author}
          type="hidden"
          name="authors"
          value={author}
        />
      ))}

      {/* Added authors appear here so they can be reviewed or removed. */}
      {authors.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {authors.map((author) => (
            <span
              key={author}
              className="inline-flex items-center gap-2 rounded-full border border-[#27430D]/10 bg-white px-3 py-1.5 text-sm font-medium text-[#27430D]"
            >
              {author}

              <button
                type="button"
                onClick={() => removeAuthor(author)}
                aria-label={`Remove ${author}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-sm text-[#523A23]/40 transition hover:bg-[#F6F1EA] hover:text-[#27430D]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {/* Keeping the same field name here means a name that has been
            typed but not yet added is still included when the form submits. */}
        <input
          id="author-name"
          name="authors"
          type="text"
          value={authorInput}
          onChange={(event) => setAuthorInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Author name"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-[#27430D]/15 bg-white px-4 py-3.5 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/30 focus:border-[#687704] focus:ring-4 focus:ring-[#687704]/5"
        />

        <button
          type="button"
          onClick={() => addAuthor()}
          className="shrink-0 rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm font-semibold text-[#27430D] transition hover:border-[#687704]/40 hover:bg-[#687704]/5"
        >
          + Add
        </button>
      </div>

      <p className="mt-2 text-xs text-[#523A23]/35">
        Press Enter or comma to add another author.
      </p>
    </div>
  );
}