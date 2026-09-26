"use client";

import { useMemo, useState } from "react";

type Range = 7 | 30 | 90;

type Visit = {
  created_at: string;
};

type DashboardViewsOverviewProps = {
  visits: Visit[];
};

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 280;

const PADDING = {
  top: 20,
  right: 18,
  bottom: 42,
  left: 52,
};

function getDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);

  copy.setHours(0, 0, 0, 0);

  return copy;
}

function addDays(
  date: Date,
  amount: number,
) {
  const copy = new Date(date);

  copy.setDate(
    copy.getDate() + amount,
  );

  return copy;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

export default function DashboardViewsOverview({
  visits,
}: DashboardViewsOverviewProps) {
  const [range, setRange] =
    useState<Range>(30);

  const chartData = useMemo(() => {
    const today = startOfDay(
      new Date(),
    );

    const currentStart = addDays(
      today,
      -(range - 1),
    );

    const previousEnd =
      addDays(currentStart, -1);

    const previousStart =
      addDays(
        previousEnd,
        -(range - 1),
      );

    const currentCounts =
      new Map<string, number>();

    let previousVisits = 0;

    visits.forEach((visit) => {
      const visitDate =
        new Date(visit.created_at);

      const visitDay =
        startOfDay(visitDate);

      if (
        visitDay >= currentStart &&
        visitDay <= today
      ) {
        const key =
          getDateKey(visitDay);

        currentCounts.set(
          key,
          (currentCounts.get(
            key,
          ) ?? 0) + 1,
        );
      }

      if (
        visitDay >= previousStart &&
        visitDay <= previousEnd
      ) {
        previousVisits += 1;
      }
    });

    const points =
      Array.from(
        {
          length: range,
        },
        (_, index) => {
          const date = addDays(
            currentStart,
            index,
          );

          return {
            date,
            value:
              currentCounts.get(
                getDateKey(date),
              ) ?? 0,
          };
        },
      );

    const currentVisits =
      points.reduce(
        (total, point) =>
          total + point.value,
        0,
      );

    const change =
      previousVisits > 0
        ? Math.round(
            ((currentVisits -
              previousVisits) /
              previousVisits) *
              100,
          )
        : currentVisits > 0
          ? 100
          : 0;

    return {
      points,
      currentVisits,
      previousVisits,
      change,
    };
  }, [range, visits]);

  const chart = useMemo(() => {
    const {
      points,
    } = chartData;

    const chartWidth =
      CHART_WIDTH -
      PADDING.left -
      PADDING.right;

    const chartHeight =
      CHART_HEIGHT -
      PADDING.top -
      PADDING.bottom;

    const maxValue = Math.max(
      ...points.map(
        (point) => point.value,
      ),
      1,
    );

    const yMax = Math.max(
      4,
      Math.ceil(maxValue / 4) *
        4,
    );

    const coordinates =
      points.map(
        (point, index) => {
          const x =
            PADDING.left +
            (index /
              Math.max(
                points.length - 1,
                1,
              )) *
              chartWidth;

          const y =
            PADDING.top +
            chartHeight -
            (point.value / yMax) *
              chartHeight;

          return {
            ...point,
            x,
            y,
          };
        },
      );

    const linePath =
      coordinates
        .map(
          (point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
        )
        .join(" ");

    const first =
      coordinates[0];

    const last =
      coordinates[
        coordinates.length - 1
      ];

    const bottom =
      PADDING.top +
      chartHeight;

    const areaPath =
      first && last
        ? `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`
        : "";

    const yTicks =
      Array.from(
        { length: 5 },
        (_, index) => ({
          value:
            (yMax / 4) *
            (4 - index),

          y:
            PADDING.top +
            (chartHeight / 4) *
              index,
        }),
      );

    const labelCount =
      range === 7 ? 7 : 7;

    const xLabelIndexes =
      new Set(
        Array.from(
          {
            length: labelCount,
          },
          (_, index) =>
            Math.round(
              (index /
                (labelCount - 1)) *
                (points.length - 1),
            ),
        ),
      );

    return {
      coordinates,
      linePath,
      areaPath,
      yTicks,
      bottom,
      xLabelIndexes,
    };
  }, [chartData, range]);

  const isPositive =
    chartData.change >= 0;

  return (
    <section className="mt-7 rounded-2xl border border-[#27430D]/10 bg-white p-6 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#687704]/10 text-[#687704]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M7 17V12M12 17V7M17 17V10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <rect
                  x="3.5"
                  y="3.5"
                  width="17"
                  height="17"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>

            <h2 className="text-xl font-semibold text-[#27430D] sm:text-2xl">
              Views Overview
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-semibold tracking-tight text-[#27430D]">
              {chartData.currentVisits.toLocaleString()}
            </p>

            <div
              className={`mb-1 flex items-center gap-1 text-sm font-semibold ${
                isPositive
                  ? "text-[#687704]"
                  : "text-red-600"
              }`}
            >
              <span aria-hidden="true">
                {isPositive
                  ? "↗"
                  : "↘"}
              </span>

              <span>
                {Math.abs(
                  chartData.change,
                )}
                %
              </span>
            </div>

            <p className="mb-1 text-xs text-[#9A806E]/70">
              from previous period
            </p>
          </div>

          <p className="mt-2 text-sm text-[#9A806E]">
            Website visits in the
            last {range} days
          </p>
        </div>

        <div className="inline-flex self-start rounded-xl border border-[#27430D]/10 bg-[#F8F5EC] p-1">
          {(
            [
              7,
              30,
              90,
            ] as Range[]
          ).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setRange(option)
              }
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                range === option
                  ? "bg-white text-[#27430D] shadow-sm"
                  : "text-[#8D7765] hover:text-[#27430D]"
              }`}
            >
              {option} days
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="min-w-175 w-full"
          role="img"
          aria-label={`Website visits for the last ${range} days`}
        >
          <defs>
            <linearGradient
              id="viewsOverviewFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#687704"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#687704"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Grid */}
          {chart.yTicks.map(
            (tick) => (
              <g
                key={
                  tick.value
                }
              >
                <line
                  x1={
                    PADDING.left
                  }
                  x2={
                    CHART_WIDTH -
                    PADDING.right
                  }
                  y1={tick.y}
                  y2={tick.y}
                  stroke="#27430D"
                  strokeOpacity="0.09"
                />

                <text
                  x={
                    PADDING.left -
                    12
                  }
                  y={
                    tick.y + 4
                  }
                  textAnchor="end"
                  fontSize="11"
                  fill="#8D7765"
                >
                  {Math.round(
                    tick.value,
                  )}
                </text>
              </g>
            ),
          )}

          {/* Area */}
          {chart.areaPath && (
            <path
              d={chart.areaPath}
              fill="url(#viewsOverviewFill)"
            />
          )}

          {/* Line */}
          {chart.linePath && (
            <path
              d={chart.linePath}
              fill="none"
              stroke="#687704"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {chart.coordinates.map(
            (
              point,
              index,
            ) =>
              point.value >
                0 && (
                <circle
                  key={`${point.date.toISOString()}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="#FDFBF4"
                  stroke="#687704"
                  strokeWidth="2"
                />
              ),
          )}

          {/* Dates */}
          {chart.coordinates.map(
            (
              point,
              index,
            ) =>
              chart.xLabelIndexes.has(
                index,
              ) && (
                <text
                  key={`label-${point.date.toISOString()}`}
                  x={point.x}
                  y={
                    chart.bottom +
                    28
                  }
                  textAnchor={
                    index === 0
                      ? "start"
                      : index ===
                          chart.coordinates
                            .length -
                            1
                        ? "end"
                        : "middle"
                  }
                  fontSize="11"
                  fill="#8D7765"
                >
                  {formatDate(
                    point.date,
                  )}
                </text>
              ),
          )}
        </svg>
      </div>
    </section>
  );
}