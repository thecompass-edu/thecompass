"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildListHref } from "@/lib/admin/list-url";

type SearchBoxProps = {
  basePath: string;
  status: string;
  defaultStatus?: string;
  initialQuery: string;
  placeholder?: string;
  debounceMs?: number;
};

export default function SearchBox({
  basePath,
  status,
  defaultStatus = "all",
  initialQuery,
  placeholder = "Search...",
  debounceMs = 400,
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const isFirstRender = useRef(true);

  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setValue(initialQuery);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      const href = buildListHref(
        basePath,
        { q: value, status, page: 1 },
        defaultStatus,
      );
      startTransition(() => {
        router.replace(href);
      });
    }, debounceMs);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="h-11 w-full rounded-xl border border-[#27430D]/10 bg-white px-4 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/40 focus:border-[#687704]"
      />

      {isPending && (
        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-[#523A23]/40">
          Searching…
        </span>
      )}
    </div>
  );
}