"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface CareerMilestone {
    title: string;
    timeframe: string;
    skills: string[];
    actions: string[];
}

interface CareerBranch {
    id: string;
    title: string;
    color: string;
    description: string;
    milestones: CareerMilestone[];
}

interface CareerTreeData {
    root: { title: string; description: string; skills: string[] };
    branches: CareerBranch[];
}

interface CareerTreeFormInput {
    skills: string;
    passions: string;
    targetRoles?: string;
    currentStage?: string;
    shortTermGoal: string;
    longTermGoal: string;
}

interface CareerTreeEntry {
    id: string;
    rootTitle: string;
    formInput: string;
    treeData: string;
    createdAt: string;
}

export function CareerTreeHistorySection({ trees }: { trees: CareerTreeEntry[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

    if (trees.length === 0) {
        return (
            <Card padding="md">
                <p className="text-sm text-[var(--color-text-muted)]">
                    No career trees yet.{" "}
                    <Link href="/career-tree" className="font-medium text-[var(--color-primary-600)] hover:underline">
                        Generate your first one →
                    </Link>
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {trees.map((entry) => {
                let treeData: CareerTreeData | null = null;
                let formInput: CareerTreeFormInput | null = null;
                try {
                    treeData = JSON.parse(entry.treeData) as CareerTreeData;
                    formInput = JSON.parse(entry.formInput) as CareerTreeFormInput;
                } catch {
                    treeData = null;
                }

                const isOpen = expanded === entry.id;
                const branchCount = treeData?.branches.length ?? 0;
                const totalMilestones = treeData?.branches.reduce((acc, b) => acc + b.milestones.length, 0) ?? 0;

                return (
                    <div
                        key={entry.id}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden transition-all"
                    >
                        {/* Card Header */}
                        <button
                            className="w-full text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                            onClick={() => setExpanded(isOpen ? null : entry.id)}
                            aria-expanded={isOpen}
                        >
                            {/* Icon */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            {/* Title + meta */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate capitalize">
                                    {entry.rootTitle}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                    {branchCount} paths · {totalMilestones} milestones ·{" "}
                                    {new Date(entry.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                                {/* Branch name pills */}
                                {treeData && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {treeData.branches.map((b) => (
                                            <span
                                                key={b.id}
                                                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                                                style={{ backgroundColor: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}
                                            >
                                                {b.title}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Chevron */}
                            <svg
                                className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Expanded Detail */}
                        {isOpen && treeData && (
                            <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-4">
                                {/* Your profile */}
                                {formInput && (
                                    <div className="rounded-lg bg-[var(--color-background)] px-4 py-3 text-xs text-[var(--color-text-muted)] space-y-1">
                                        <p><span className="font-semibold text-[var(--color-text)]">Skills:</span> {formInput.skills}</p>
                                        {formInput.currentStage && <p><span className="font-semibold text-[var(--color-text)]">Stage:</span> {formInput.currentStage}</p>}
                                        <p><span className="font-semibold text-[var(--color-text)]">Short-term goal:</span> {formInput.shortTermGoal}</p>
                                        <p><span className="font-semibold text-[var(--color-text)]">Long-term goal:</span> {formInput.longTermGoal}</p>
                                    </div>
                                )}

                                {/* Description from root */}
                                <p className="text-sm text-[var(--color-text-muted)]">{treeData.root.description}</p>

                                {/* Branches */}
                                <div className="space-y-3">
                                    {treeData.branches.map((branch) => {
                                        const branchKey = `${entry.id}-${branch.id}`;
                                        const isBranchOpen = expandedBranch === branchKey;

                                        return (
                                            <div
                                                key={branch.id}
                                                className="rounded-lg border overflow-hidden"
                                                style={{ borderColor: `${branch.color}40` }}
                                            >
                                                {/* Branch header */}
                                                <button
                                                    className="w-full text-left px-4 py-3 flex items-center gap-2 transition-colors"
                                                    style={{ backgroundColor: `${branch.color}10` }}
                                                    onClick={() => setExpandedBranch(isBranchOpen ? null : branchKey)}
                                                >
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: branch.color }}
                                                    />
                                                    <span
                                                        className="flex-1 text-sm font-semibold"
                                                        style={{ color: branch.color }}
                                                    >
                                                        {branch.title}
                                                    </span>
                                                    <span className="text-xs text-[var(--color-text-muted)]">
                                                        {branch.milestones.length} milestones
                                                    </span>
                                                    <svg
                                                        className={`h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)] transition-transform ${isBranchOpen ? "rotate-180" : ""}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {/* Milestones */}
                                                {isBranchOpen && (
                                                    <div className="px-4 pb-4 pt-3 space-y-4 bg-[var(--color-surface)]">
                                                        <p className="text-xs text-[var(--color-text-muted)]">{branch.description}</p>
                                                        <div className="space-y-3">
                                                            {branch.milestones.map((ms, i) => (
                                                                <div key={i} className="flex gap-3">
                                                                    <div
                                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5"
                                                                        style={{ backgroundColor: branch.color }}
                                                                    >
                                                                        {i + 1}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            <p className="text-sm font-semibold text-[var(--color-text)]">{ms.title}</p>
                                                                            <span className="rounded-full px-2 py-0.5 text-xs"
                                                                                style={{ color: branch.color, backgroundColor: `${branch.color}15`, border: `1px solid ${branch.color}30` }}>
                                                                                {ms.timeframe}
                                                                            </span>
                                                                        </div>
                                                                        {/* Skills */}
                                                                        {ms.skills.length > 0 && (
                                                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                                                {ms.skills.map((skill, j) => (
                                                                                    <span key={j} className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                                                                                        {skill}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                        {/* Actions */}
                                                                        {ms.actions.length > 0 && (
                                                                            <ul className="mt-2 space-y-1">
                                                                                {ms.actions.map((action, j) => (
                                                                                    <li key={j} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                                                                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: branch.color }} />
                                                                                        {action}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="pt-2 border-t border-[var(--color-border)]">
                                    <Link href="/career-tree" className="text-sm font-medium text-[var(--color-primary-600)] hover:underline">
                                        Generate a new tree →
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
