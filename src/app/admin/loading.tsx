export default function AdminLoading() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-[#27430D]/10" />

        <div className="mt-4 h-10 w-56 rounded-lg bg-[#27430D]/10" />

        <div className="mt-3 h-4 w-80 max-w-full rounded bg-[#27430D]/10" />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-3xl border border-[#27430D]/10 bg-white"
            >
              <div className="space-y-4 p-6">
                <div className="h-4 w-24 rounded bg-[#27430D]/10" />
                <div className="h-9 w-20 rounded bg-[#27430D]/10" />
                <div className="h-3 w-32 rounded bg-[#27430D]/10" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 h-80 rounded-3xl border border-[#27430D]/10 bg-white" />
      </div>
    </div>
  );
}