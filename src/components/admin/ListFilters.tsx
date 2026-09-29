import Link from "next/link";
import { buildListHref } from "@/lib/admin/list-url";

export type FilterOption = {
  label: string;
  value: string;
};

type ListFiltersProps = {
  basePath: string;
  q: string;
  status: string;
  statusOptions?: readonly FilterOption[];
  defaultStatus?: string;
  searchPlaceholder?: string;
};

export default function ListFilters({
  basePath,
  q,
  status,
  statusOptions,
  defaultStatus = "all",
  searchPlaceholder = "Search...",
}: ListFiltersProps) {
  const isFiltering = q !== "" || status !== defaultStatus;

  return (
    <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {statusOptions && statusOptions.length > 0 ? (
        <div className="inline-flex w-fit rounded-xl border border-[#27430D]/10 bg-white p-1">
          {statusOptions.map((option) => {
            const active = status === option.value;
            return (
              <Link
                key={option.value}
                href={buildListHref(
                  basePath,
                  { q, status: option.value, page: 1 },
                  defaultStatus,
                )}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[#27430D] text-white"
                    : "text-[#523A23]/70 hover:bg-[#F6F1EA]"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      ) : (
        <div />
      )}

      {/* Search */}
      <form
        action={basePath}
        method="get"
        className="flex w-full gap-2 lg:max-w-md"
      >
        {status !== defaultStatus && (
          <input type="hidden" name="status" value={status} />
        )}

        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-xl border border-[#27430D]/10 bg-white px-4 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/40 focus:border-[#687704]"
        />

        <button
          type="submit"
          className="h-11 shrink-0 rounded-xl bg-[#27430D] px-5 text-sm font-semibold text-white transition hover:bg-[#35551A]"
        >
          Search
        </button>

        {isFiltering && (
          <Link
            href={basePath}
            className="inline-flex h-11 shrink-0 items-center rounded-xl border border-[#27430D]/10 bg-white px-4 text-sm font-semibold text-[#523A23]/70 transition hover:bg-[#F6F1EA]"
          >
            Reset
          </Link>
        )}
      </form>
    </div>
  );
}