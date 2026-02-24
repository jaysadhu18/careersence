"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";

interface RoadmapEntry {
    id: string;
    careerGoal: string;
    stages: string;
    createdAt: string;
}

interface Stage {
    title: string;
    description: string;
    timeRange: string;
    actions: string[];
    resources?: string[];
}

export function RoadmapHistorySection({ roadmaps }: { roadmaps: RoadmapEntry[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);

    if (roadmaps.length === 0) {
        return (
            <Card padding="md">
                <p className="text-sm text-[var(--color-text-muted)]">
                    No roadmaps yet.{" "}
                    <Link href="/ai-roadmap" className="font-medium text-[var(--color-primary-600)] hover:underline">
                        Generate your first one →
                    </Link>
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {roadmaps.map((rm) => {
                let stages: Stage[] = [];
                try {
                    stages = JSON.parse(rm.stages) as Stage[];
                } catch {
                    stages = [];
                }
                const isOpen = expanded === rm.id;

                return (
                    <div key={rm.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden transition-all">
                        {/* Card Header — always visible */}
                        <button
                            className="w-full text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                            onClick={() => setExpanded(isOpen ? null : rm.id)}
                            aria-expanded={isOpen}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{rm.careerGoal}</p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                    {stages.length} stages · {new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                            </div>
                            <svg
                                className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Expanded stages */}
                        {isOpen && (
                            <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-4">
                                {stages.map((stage, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white mt-0.5">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-semibold text-[var(--color-text)]">{stage.title}</p>
                                                {stage.timeRange && (
                                                    <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                                                        {stage.timeRange}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{stage.description}</p>
                                            {stage.actions.length > 0 && (
                                                <ul className="mt-2 space-y-1">
                                                    {stage.actions.map((action, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-400)]" />
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-[var(--color-border)]">
                                    <Link
                                        href="/ai-roadmap"
                                        className="text-sm font-medium text-[var(--color-primary-600)] hover:underline"
                                    >
                                        Open full roadmap →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
