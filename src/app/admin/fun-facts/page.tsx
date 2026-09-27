import Link from "next/link";

import FunFactActionsMenu from "@/components/admin/FunFactActionsMenu";
import { createClient } from "@/lib/supabase/server";

type FunFact = {
  id: string;
  title: string;
  description: string;
  fun_fact_number: number | null;
  image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function FunFactsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fun_facts")
    .select(`
      id,
      title,
      description,
      fun_fact_number,
      image_url,
      status,
      published_at,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "FUN FACTS FETCH ERROR:",
      error,
    );
  }

  const funFacts =
    (data ?? []) as FunFact[];

  const totalFunFacts =
    funFacts.length;

  const publishedCount =
    funFacts.filter(
      (funFact) =>
        funFact.status === "published",
    ).length;

  const draftCount =
    funFacts.filter(
      (funFact) =>
        funFact.status === "draft",
    ).length;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* HEADER */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
            CONTENT
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#27430D] sm:text-4xl">
            Weekly Fun Facts
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7B886C] sm:text-base">
            Manage weekly financial fun facts.
          </p>
        </div>

        <Link
          href="/admin/fun-facts/new"
          className="
            inline-flex
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#27430D]
            px-6
            py-3.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#35551A]
          "
        >
          New Fun Fact
        </Link>
      </div>

      {/* COUNTERS */}
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Total
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {totalFunFacts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Published
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-[#27430D]/10 bg-white px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7B886C]">
            Drafts
          </p>

          <p className="mt-3 text-3xl font-bold text-[#27430D]">
            {draftCount}
          </p>
        </div>
      </div>

      {/* FUN FACT TABLE */}
      <div className="mt-10">
        {funFacts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[#27430D]/10 bg-white">
            {/* DESKTOP HEADER */}
            <div
              className="
                hidden
                grid-cols-[minmax(0,1.7fr)_150px_160px_100px]
                items-center
                gap-5
                border-b
                border-[#27430D]/10
                bg-[#F8F5EC]
                px-7
                py-5
                text-xs
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#687704]
                md:grid
              "
            >
              <span>
                Fun Fact
              </span>

              <span>
                Status
              </span>

              <span>
                Published
              </span>

              <span className="text-right">
                Action
              </span>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-[#27430D]/10">
              {funFacts.map(
                (funFact) => (
                  <div
                    key={funFact.id}
                    className="
                      grid
                      gap-5
                      px-7
                      py-6
                      transition
                      hover:bg-[#FDFBF7]
                      md:grid-cols-[minmax(0,1.7fr)_150px_160px_100px]
                      md:items-center
                    "
                  >
                    {/* FUN FACT */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        {funFact.fun_fact_number && (
                          <span className="shrink-0 text-xs font-bold tracking-[0.12em] text-[#687704]">
                            #
                            {
                              funFact.fun_fact_number
                            }
                          </span>
                        )}

                        <p className="truncate font-semibold text-[#27430D]">
                          {funFact.title}
                        </p>
                      </div>

                      {funFact.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-[#8D7765]">
                          {funFact.description}
                        </p>
                      )}
                    </div>

                    {/* STATUS */}
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          funFact.status ===
                          "published"
                            ? "bg-[#EEF3E4] text-[#536B0F]"
                            : "bg-[#F6F1EA] text-[#765C43]"
                        }`}
                      >
                        {funFact.status === "published"
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    {/* PUBLISHED DATE */}
                    <div className="text-sm text-[#8D7765]">
                      {funFact.status === "published"
                        ? formatDate(
                            funFact.published_at,
                          )
                        : "—"}
                    </div>

                    {/* ACTION MENU */}
                    <div className="flex md:justify-end">
                      <FunFactActionsMenu
                        funFactId={funFact.id}
                        funFactTitle={funFact.title}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#27430D]/20 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-[#27430D]">
              No Fun Facts yet
            </p>

            <p className="mt-2 text-sm text-[#7B886C]">
              Create your first Weekly Fun Fact.
            </p>

            <Link
              href="/admin/fun-facts/new"
              className="mt-6 inline-flex rounded-xl bg-[#27430D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35551A]"
            >
              Create Fun Fact
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}