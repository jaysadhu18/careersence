"use client";

import { useEffect, useState } from "react";

interface Stats {
  total: number;
  active: number;
  disabled: number;
  newThisMonth: number;
  totalRoadmaps: number;
  totalQuizzes: number;
  totalCareerTrees: number;
  totalResumeAnalyses: number;
  totalSavedJobs: number;
}

function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="mb-3 h-4 w-24 rounded bg-[var(--color-border)]" />
      <div className="h-8 w-16 rounded bg-[var(--color-border)]" />
    </div>
  );
}

const statConfig = [
  {
    key: "total" as keyof Stats,
    label: "Total Users",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: "text-[var(--color-primary-600)] bg-[var(--color-primary-50)]",
  },
  {
    key: "active" as keyof Stats,
    label: "Active Users",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-green-600 bg-green-50",
  },
  {
    key: "disabled" as keyof Stats,
    label: "Disabled Users",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    color: "text-red-600 bg-red-50",
  },
  {
    key: "newThisMonth" as keyof Stats,
    label: "New This Month",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: "text-[var(--color-secondary-600)] bg-[var(--color-secondary-50)]",
  },
  {
    key: "totalRoadmaps" as keyof Stats,
    label: "Roadmaps",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    key: "totalQuizzes" as keyof Stats,
    label: "Quiz Sessions",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: "text-purple-600 bg-purple-50",
  },
  {
    key: "totalResumeAnalyses" as keyof Stats,
    label: "Resumes Analyzed",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "text-orange-600 bg-orange-50",
  },
  {
    key: "totalSavedJobs" as keyof Stats,
    label: "Saved Jobs",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-pink-600 bg-pink-50",
  },
];

export function StatCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map(({ key, label, icon, color }) => (
        <div
          key={key}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">{label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">{stats[key]}</p>
            </div>
            <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
