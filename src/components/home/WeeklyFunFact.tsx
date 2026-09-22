import Link from "next/link";

import RevealOnScroll from "@/components/home/RevealOnScroll";

export default function WeeklyFunFact() {
  return (
    <aside className="lg:pt-20.25">
      <RevealOnScroll
        className="
          translate-y-12
          opacity-0
          transition-all
          delay-150
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]
          data-[visible=true]:translate-y-0
          data-[visible=true]:opacity-100
        "
      >
        <div className="border border-[#27430D]/10 bg-[#FEFEFE]/70 p-6">
          {/* Fun Fact Header */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#687704]/30 bg-[#F8F5EC]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#687704]"
              >
                <path
                  d="M9 18h6M10 22h4M8.5 15.5C6.96 14.42 6 12.64 6 10.5a6 6 0 1112 0c0 2.14-.96 3.92-2.5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="text-sm font-bold tracking-[0.14em] text-[#27430D]">
              WEEKLY FUN FACT
            </p>
          </div>

          {/* Fun Fact Image Placeholder */}
          <div className="flex aspect-4/3 items-center justify-center overflow-hidden bg-[#F8F5EC]">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687704]">
                Fun Fact Image
              </p>

              <p className="mt-1 text-sm text-[#523A23]/50">
                Placeholder
              </p>
            </div>
          </div>

          {/* Fun Fact Content */}
          <div className="mt-6">
            <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
              FUN FACT #1
            </p>

            <h3 className="mt-3 text-2xl font-bold text-[#27430D]">
              Fun Fact Title
            </h3>

            <p className="mt-3 text-sm text-[#523A23]/50">
              Sep 12, 2026
            </p>
          </div>

          {/* View Story */}
          <Link
            href="#"
            className="
              group/story
              mt-7
              flex
              items-center
              justify-between
              border
              border-[#687704]/30
              bg-[#F8F5EC]
              px-5
              py-4
              font-semibold
              text-[#27430D]
              transition-colors
              duration-300
              hover:bg-[#687704]/10
            "
          >
            <span>View Story</span>

            <span
              aria-hidden="true"
              className="
                transition-transform
                duration-300
                group-hover/story:translate-x-1
              "
            >
              →
            </span>
          </Link>
        </div>
      </RevealOnScroll>
    </aside>
  );
}