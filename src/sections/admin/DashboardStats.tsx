type DashboardStat = {
  label: string;
  value: number;
  description: string;
};

type DashboardStatsProps = {
  stats: DashboardStat[];
};

export default function DashboardStats({
  stats,
}: DashboardStatsProps) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="
            rounded-2xl
            border
            border-[#27430D]/10
            bg-white
            px-6
            py-7
            transition-all
            duration-300
            hover:-translate-y-1
            hover:border-[#687704]/30
            hover:shadow-[0_12px_30px_rgba(39,67,13,0.06)]
          "
        >
          <p className="text-sm text-[#9A806E] sm:text-base">
            {stat.label}
          </p>

          <p className="mt-5 text-4xl font-semibold tracking-tight text-[#27430D]">
            {stat.value.toLocaleString()}
          </p>

          <p className="mt-2 text-xs text-[#9A806E]/60">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}