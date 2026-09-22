type VisitorCountry = {
  code: string;
  name: string;
  visits: number;
  percentage: number;
};

type VisitorCountriesProps = {
  countries: VisitorCountry[];
};

export default function VisitorCountries({
  countries,
}: VisitorCountriesProps) {
  return (
    <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6 sm:p-7">
      <div>
        <p className="text-xl font-semibold text-[#27430D] sm:text-2xl">
          Visitor Countries
        </p>

        <p className="mt-1 text-sm text-[#9A806E] sm:text-base">
          Where your website visitors are coming from.
        </p>
      </div>

      {countries.length > 0 ? (
        <div className="mt-8 space-y-5 rounded-xl bg-[#F8F5EC] p-5 sm:p-6">
          {countries.map(
            (country) => (
              <div key={country.code}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#27430D] sm:text-base">
                      {country.name}
                    </p>

                    <p className="mt-0.5 text-xs text-[#9A806E]">
                      {country.visits.toLocaleString()}{" "}
                      {country.visits === 1
                        ? "visit"
                        : "visits"}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-[#27430D]">
                    {country.percentage}%
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#27430D]/10">
                  <div
                    className="h-full rounded-full bg-[#687704]"
                    style={{
                      width: `${country.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="mt-8 flex min-h-64 items-center justify-center rounded-xl bg-[#F8F5EC] px-6 text-center">
          <div>
            <p className="text-sm text-[#9A806E]">
              No visitor data yet
            </p>

            <p className="mt-2 max-w-xs text-xs leading-5 text-[#9A806E]/60">
              Country analytics will appear here once visitors begin
              using the website.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}