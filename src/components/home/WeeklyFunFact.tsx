import Image from "next/image";

import FunFactStoryModal from "@/components/home/FunFactStoryModal";
import RevealOnScroll from "@/components/home/RevealOnScroll";
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
};

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function WeeklyFunFact() {
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
      created_at
    `)
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(
      "WEEKLY FUN FACT FETCH ERROR:",
      error,
    );
  }

  const funFacts = (data ?? []) as FunFact[];

  const latestFunFact =
    funFacts[0] ?? null;

  const olderFunFacts = funFacts
    .slice(1)
    .sort((a, b) => {
      const aNumber =
        a.fun_fact_number ?? 999999;

      const bNumber =
        b.fun_fact_number ?? 999999;

      return aNumber - bNumber;
    });

  const storyOrder = latestFunFact
    ? [
        latestFunFact,
        ...olderFunFacts,
      ]
    : [];

  const stories = storyOrder
    .filter(
      (funFact) =>
        Boolean(funFact.image_url),
    )
    .map((funFact) => ({
      id: funFact.id,
      title: funFact.title,
      imageUrl:
        funFact.image_url as string,
      funFactNumber:
        funFact.fun_fact_number,
    }));

  const publishedDate =
    latestFunFact
      ? formatDate(
          latestFunFact.published_at ??
            latestFunFact.created_at,
        )
      : "";

  return (
    <aside className="self-start lg:sticky lg:top-24 lg:pt-20.25">
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
        <div className="border border-[#27430D]/15 bg-[#FDFBF4] p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5EC]">
              <Image
                src="/images/logo.svg"
                alt=""
                width={23}
                height={23}
                className="h-5.5 w-5.5 object-contain"
              />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#27430D]">
                WEEKLY FUN FACT
              </p>

              <p className="mt-1 text-[11px] text-[#7B886C]">
                A quick financial insight from The Compass
              </p>
            </div>
          </div>

          {latestFunFact ? (
            <>
              {/* Fun Fact image */}
              <div className="group relative aspect-4/3 w-full overflow-hidden bg-[#F8F5EC]">
                {latestFunFact.image_url ? (
                  <>
                    <Image
                      src={
                        latestFunFact.image_url
                      }
                      alt={
                        latestFunFact.title
                      }
                      fill
                      sizes="(max-width: 1024px) 100vw, 340px"
                      className="
                        object-cover
                        object-top
                        transition-transform
                        duration-700
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        group-hover:scale-[1.025]
                      "
                    />

                    <div className="pointer-events-none absolute inset-0 bg-[#27430D]/5 transition-colors duration-500 group-hover:bg-transparent" />
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                    <div className="relative h-10 w-10">
                      <Image
                        src="/images/logo.svg"
                        alt=""
                        fill
                        className="object-contain opacity-40"
                      />
                    </div>

                    <p className="mt-3 text-xs font-bold tracking-[0.15em] text-[#687704]">
                      THE COMPASS
                    </p>

                    <p className="mt-1 text-sm text-[#7B886C]">
                      Weekly Fun Fact
                    </p>
                  </div>
                )}
              </div>

              {/* Fun Fact details */}
              <div className="mt-6">
                {latestFunFact.fun_fact_number && (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#687704]">
                    FUN FACT #
                    {
                      latestFunFact.fun_fact_number
                    }
                  </p>
                )}

                <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#27430D]">
                  {
                    latestFunFact.title
                  }
                </h3>

                {latestFunFact.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#7B886C]">
                    {
                      latestFunFact.description
                    }
                  </p>
                )}

                {publishedDate && (
                  <p className="mt-4 text-sm text-[#8D7765]/70">
                    {publishedDate}
                  </p>
                )}
              </div>

              {stories.length > 0 && (
                <FunFactStoryModal
                  stories={stories}
                />
              )}
            </>
          ) : (
            <div className="flex aspect-4/3 flex-col items-center justify-center border border-[#27430D]/10 bg-[#F8F5EC] px-7 text-center">
              <div className="relative h-10 w-10 opacity-40">
                <Image
                  src="/images/logo.svg"
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>

              <p className="mt-4 font-semibold text-[#27430D]">
                New Fun Fact coming soon
              </p>

              <p className="mt-2 max-w-56 text-sm leading-6 text-[#7B886C]">
                Check back for the next weekly financial Fun Fact.
              </p>
            </div>
          )}
        </div>
      </RevealOnScroll>
    </aside>
  );
}