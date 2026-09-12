const stats = [
  {
    label: "Total Articles",
    value: "0",
  },
  {
    label: "Published",
    value: "0",
  },
  {
    label: "Drafts",
    value: "0",
  },
  {
    label: "Total Views",
    value: "0",
  },
];

export default function AdminPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.2em] text-[#687704]">
          OVERVIEW
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#27430D]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[#523A23]/60">
          Manage your articles and monitor website performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#27430D]/10 bg-white p-6"
          >
            <p className="text-sm font-medium text-[#523A23]/55">
              {stat.label}
            </p>

            <p className="mt-4 text-3xl font-bold text-[#27430D]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Top Articles */}
        <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
          <div>
            <h2 className="text-lg font-bold text-[#27430D]">
              Top Performing Articles
            </h2>

            <p className="mt-1 text-sm text-[#523A23]/50">
              Your most viewed published articles.
            </p>
          </div>

          <div className="mt-8 flex min-h-[220px] items-center justify-center rounded-xl bg-[#F6F1EA]">
            <p className="text-sm text-[#523A23]/45">
              No article data yet
            </p>
          </div>
        </section>

        {/* Countries */}
        <section className="rounded-2xl border border-[#27430D]/10 bg-white p-6">
          <div>
            <h2 className="text-lg font-bold text-[#27430D]">
              Visitor Countries
            </h2>

            <p className="mt-1 text-sm text-[#523A23]/50">
              Where your website visitors are coming from.
            </p>
          </div>

          <div className="mt-8 flex min-h-[220px] items-center justify-center rounded-xl bg-[#F6F1EA]">
            <p className="text-sm text-[#523A23]/45">
              No visitor data yet
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}