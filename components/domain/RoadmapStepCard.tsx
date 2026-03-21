"use client";

import { useState } from "react";
import Link from "next/link";
import type { RoadmapStage, StageStatus } from "@/lib/hooks/useRoadmap";

interface RoadmapStepCardProps {
  stage: RoadmapStage;
  stepIndex?: number;
  onStatusChange?: (status: StageStatus) => void;
}

const statusConfig: Record<
  StageStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  not_started: {
    label: "Not started",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
      </svg>
    ),
  },
  in_progress: {
    label: "In progress",
    className: "bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]",
    icon: (
      <svg className="h-3.5 w-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
};

const stepIcons = [
  <svg key="0" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  <svg key="1" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  <svg key="2" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  <svg key="3" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  <svg key="4" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
];

const borderGradientByStatus: Record<StageStatus, string> = {
  not_started: "border-l-slate-300",
  in_progress: "border-l-[var(--color-primary-500)]",
  completed: "border-l-emerald-500",
};

export function RoadmapStepCard({
  stage,
  stepIndex = 0,
  onStatusChange,
}: RoadmapStepCardProps) {
  const [expanded, setExpanded] = useState(stage.status === "in_progress");
  const [resources, setResources] = useState<any[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [resFetched, setResFetched] = useState(false);
  const status = statusConfig[stage.status];
  const Icon = stepIcons[stepIndex % stepIcons.length];

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !resFetched) {
      setResLoading(true);
      setResFetched(true);
      fetch("/api/courses/search?q=" + encodeURIComponent(stage.title))
        .then((r) => r.json())
        .then((d) => setResources((d.courses || []).slice(0, 2)))
        .catch(() => {})
        .finally(() => setResLoading(false));
    }
  };

  return (
    <div
      className={`roadmap-card rounded-2xl border border-[var(--color-border)] border-l-4 bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] ${borderGradientByStatus[stage.status]}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
            {Icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
              {stage.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stage.timeRange}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.className}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {stage.description}
      </p>

      <button
        type="button"
        onClick={toggleExpand}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-[var(--color-primary-600)] transition-colors hover:text-[var(--color-primary-700)]"
      >
        {expanded ? "Hide" : "Show"} action items
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <>
        <ul className="mt-4 space-y-2">
          {stage.actions.map((action, i) => (
            <li
              key={i}
              className="roadmap-action-item flex items-start gap-3 rounded-lg bg-[var(--color-background)] py-2 pl-3 pr-3 text-sm text-[var(--color-text)]"
            >
              <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-primary-300)] bg-[var(--color-primary-50)] text-[10px] font-semibold text-[var(--color-primary-600)]">
                {i + 1}
              </span>
              <span className="flex-1">{action}</span>
            </li>
          ))}
        </ul>

        {/* Resources */}
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-400)] mb-2">Suggested Resources</p>
          {resLoading ? (
            <p className="text-xs text-[var(--color-text-muted)]">Finding resources...</p>
          ) : resources.length === 0 ? null : (
            <>
              <div className="flex flex-col gap-2">
                {resources.map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 hover:border-[var(--color-primary-400)]/60 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-primary-500)] transition-colors">{r.title}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{r.source} · {r.type}</p>
                    </div>
                    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary-500)] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                ))}
              </div>
              <Link href={"/learning-resources?q=" + encodeURIComponent(stage.title)}
                className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary-500)] hover:underline">
                Show more →
              </Link>
            </>
          )}
        </div>
        </>
      )}

      {onStatusChange && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5">
          {(
            ["not_started", "in_progress", "completed"] as StageStatus[]
          ).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all ${stage.status === s
                  ? statusConfig[s].className + " border-current"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                }`}
            >
              {statusConfig[s].icon}
              {statusConfig[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
