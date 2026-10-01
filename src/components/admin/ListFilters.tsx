import Link from "next/link";
import { buildListHref } from "@/lib/admin/list-url";
import SearchBox from "./Searchbox";

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
      <div className="flex w-full items-center gap-2 lg:max-w-md">
        <SearchBox
          basePath={basePath}
          status={status}
          defaultStatus={defaultStatus}
          initialQuery={q}
          placeholder={searchPlaceholder}
        />
      </div>
    </div>
  );
}