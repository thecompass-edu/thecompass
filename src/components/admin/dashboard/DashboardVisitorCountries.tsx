type VisitorCountry = {
  code: string;
  name: string;
  visits: number;
  percentage: number;
};

type DashboardVisitorCountriesProps = {
  countries: VisitorCountry[];
  totalVisitors: number;
  periodLabel: string;
};

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M3.5 12C5.1 8.7 8.2 6.5 12 6.5C15.8 6.5 18.9 8.7 20.5 12C18.9 15.3 15.8 17.5 12 17.5C8.2 17.5 5.1 15.3 3.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function DashboardVisitorCountries({
  countries,
  totalVisitors,
  periodLabel,
}: DashboardVisitorCountriesProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#27430D]/10 bg-white">
      {/* Header */}
      <div className="border-b border-[#27430D]/8 px-6 py-6 sm:px-7">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#687704]/15 bg-[#EEF3E7] text-[#687704]">
            <EyeIcon />
          </span>

          <div>
            <h2 className="text-xl font-semibold text-[#27430D] sm:text-2xl">
              Visitors by Country
            </h2>

            <p className="mt-1 text-sm text-[#8D7765]">
              {totalVisitors.toLocaleString()}{" "}
              {totalVisitors === 1
                ? "visitor"
                : "visitors"}{" "}
              · {periodLabel}
            </p>
          </div>
        </div>
      </div>

      {countries.length > 0 ? (
        <div className="px-6 pb-3 sm:px-7">
          {/* Columns */}
          <div className="grid grid-cols-[minmax(0,1fr)_70px_75px] border-b border-[#27430D]/8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#8D7765]">
            <span>Country</span>

            <span className="text-right">
              Visits
            </span>

            <span className="text-right">
              Share
            </span>
          </div>

          {/* Countries */}
          <div className="max-h-110 overflow-y-auto pr-1">
            {countries.map(
              (country) => (
                <div
                  key={country.code}
                  className="grid min-h-22 grid-cols-[minmax(0,1fr)_70px_75px] items-center border-b border-[#27430D]/8 py-4 last:border-b-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-semibold text-[#27430D] sm:text-base">
                      {country.name}
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8D7765]/75">
                      {country.code === "Unknown"
                        ? "Unknown location"
                        : country.code}
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#27430D]/8">
                      <div
                        className="h-full rounded-full bg-[#687704]"
                        style={{
                          width: `${country.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span className="text-right text-sm font-semibold text-[#27430D] sm:text-base">
                    {country.visits.toLocaleString()}
                  </span>

                  <span className="text-right text-sm font-medium text-[#8D7765] sm:text-base">
                    {country.percentage}%
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-50 items-center justify-center px-6 text-center">
          <div>
            <p className="text-sm font-medium text-[#27430D]">
              No visitor data yet
            </p>

            <p className="mt-2 max-w-sm text-xs leading-5 text-[#8D7765]/70">
              Country analytics will appear here once visitors start using The
              Compass.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}