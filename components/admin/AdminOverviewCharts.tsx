"use client";

import { useEffect, useMemo, useState } from "react";

type ActivityType =
  | "registration"
  | "roadmap"
  | "quiz"
  | "career_tree"
  | "resume_analysis"
  | "saved_job";

interface ActivityTypePoint {
  type: ActivityType;
  label: string;
  count: number;
}

interface ActivityTrendPoint {
  date: string;
  count: number;
}

interface AdminChartResponse {
  days: number;
  totalActivities: number;
  activityByType: ActivityTypePoint[];
  activityTrend: ActivityTrendPoint[];
}

const TYPE_STYLES: Record<ActivityType, { bar: string; dot: string; text: string }> = {
  registration: {
    bar: "bg-[var(--color-primary-500)]",
    dot: "bg-[var(--color-primary-500)]",
    text: "text-[var(--color-primary-700)]",
  },
  roadmap: {
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
    text: "text-indigo-700",
  },
  quiz: {
    bar: "bg-purple-500",
    dot: "bg-purple-500",
    text: "text-purple-700",
  },
  career_tree: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  resume_analysis: {
    bar: "bg-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-700",
  },
  saved_job: {
    bar: "bg-pink-500",
    dot: "bg-pink-500",
    text: "text-pink-700",
  },
};

function ChartSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="mb-6 h-5 w-40 rounded bg-[var(--color-border)]" />
          <div className="h-56 rounded-xl bg-[var(--color-background)]" />
        </div>
      ))}
    </div>
  );
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function ActivityTrendChart({
  data,
  days,
}: {
  data: ActivityTrendPoint[];
  days: number;
}) {
  const width = 640;
  const height = 240;
  const padding = { top: 18, right: 18, bottom: 34, left: 18 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(...data.map((point) => point.count), 1);
  const totalRecent = data.reduce((sum, point) => sum + point.count, 0);

  const coordinates = data.map((point, index) => {
    const x =
      data.length === 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (point.count / maxCount) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = coordinates.length
    ? [
        `M ${coordinates[0].x} ${padding.top + innerHeight}`,
        ...coordinates.map((point) => `L ${point.x} ${point.y}`),
        `L ${coordinates[coordinates.length - 1].x} ${padding.top + innerHeight}`,
        "Z",
      ].join(" ")
    : "";

  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Recent Activity Trend</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            Total admin-tracked actions across the last {days} days
          </p>
        </div>
        <div className="rounded-xl bg-[var(--color-background)] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Recent activity</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{totalRecent}</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        <defs>
          <linearGradient id="activity-trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(79 70 229 / 0.35)" />
            <stop offset="100%" stopColor="rgb(79 70 229 / 0.02)" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((step) => {
          const y = padding.top + innerHeight * step;
          return (
            <line
              key={step}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="rgb(148 163 184 / 0.25)"
              strokeDasharray="4 6"
            />
          );
        })}

        {areaPath ? <path d={areaPath} fill="url(#activity-trend-fill)" /> : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke="rgb(79 70 229)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        ) : null}

        {coordinates.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="rgb(79 70 229)" />
            <circle cx={point.x} cy={point.y} r="8" fill="rgb(79 70 229 / 0.12)" />
          </g>
        ))}

        {coordinates.map((point, index) => {
          const isVisibleLabel =
            index % labelStep === 0 || index === coordinates.length - 1;

          if (!isVisibleLabel) return null;

          return (
            <text
              key={`${point.date}-label`}
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-[var(--color-text-muted)] text-[11px]"
            >
              {formatDateLabel(point.date)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function ActivityBreakdownChart({
  data,
  totalActivities,
}: {
  data: ActivityTypePoint[];
  totalActivities: number;
}) {
  const topActivity = data[0];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Feature Usage Breakdown</h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          Share of total tracked activity by feature
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-[var(--color-background)] p-4">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Most used feature</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${TYPE_STYLES[topActivity.type].dot}`} />
            <p className={`font-semibold ${TYPE_STYLES[topActivity.type].text}`}>{topActivity.label}</p>
          </div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{topActivity.count}</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const percentage = totalActivities > 0 ? (item.count / totalActivities) * 100 : 0;

          return (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${TYPE_STYLES[item.type].dot}`} />
                  <span className="text-sm font-medium text-[var(--color-text)]">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{item.count}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{percentage.toFixed(1)}%</p>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-background)]">
                <div
                  className={`h-full rounded-full ${TYPE_STYLES[item.type].bar}`}
                  style={{ width: `${Math.max(percentage, item.count > 0 ? 6 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminOverviewCharts() {
  const [data, setData] = useState<AdminChartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCharts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/charts?days=14");
        if (!response.ok) {
          throw new Error("Failed to load chart data.");
        }

        const payload = (await response.json()) as AdminChartResponse;
        if (active) {
          setData(payload);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard charts.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCharts();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      ...data,
      activityByType:
        data.activityByType.length > 0
          ? data.activityByType
          : [
              {
                type: "registration" as const,
                label: "Registrations",
                count: 0,
              },
            ],
    };
  }, [data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  if (error || !chartData) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-base font-semibold text-[var(--color-text)]">Activity Analytics</h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {error ?? "Chart data is currently unavailable."}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text)]">Activity Analytics</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Quick visual insight into platform usage and engagement
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
        <ActivityTrendChart data={chartData.activityTrend} days={chartData.days} />
        <ActivityBreakdownChart
          data={chartData.activityByType}
          totalActivities={chartData.totalActivities}
        />
      </div>
    </section>
  );
}
