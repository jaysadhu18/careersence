"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CareerResult {
    id: string;
    title: string;
    summary: string;
    salaryMin: number;
    salaryMax: number;
    education: string;
    skills: string[];
    matchScore: number;
}

interface QuizEntry {
    id: string;
    phase1Answers: string;
    results: string | null;
    createdAt: string;
}

function formatSalary(min: number, max: number): string {
    const fmt = (n: number) =>
        n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
    return `${fmt(min)} – ${fmt(max)}`;
}

export function QuizHistorySection({ quizzes }: { quizzes: QuizEntry[] }) {
    const [expanded, setExpanded] = useState<string | null>(null);

    if (quizzes.length === 0) {
        return (
            <Card padding="md">
                <p className="text-sm text-[var(--color-text-muted)]">
                    No quiz attempts yet.{" "}
                    <Link
                        href="/career-quiz"
                        className="font-medium text-[var(--color-primary-600)] hover:underline"
                    >
                        Take the career quiz →
                    </Link>
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {quizzes.map((quiz) => {
                let results: CareerResult[] = [];
                try {
                    if (quiz.results) results = JSON.parse(quiz.results) as CareerResult[];
                } catch {
                    results = [];
                }

                let phase1: { question: string; answer: string }[] = [];
                try {
                    phase1 = JSON.parse(quiz.phase1Answers) as { question: string; answer: string }[];
                } catch {
                    phase1 = [];
                }

                const isOpen = expanded === quiz.id;
                const topMatch = results[0];
                const hasResults = results.length > 0;

                return (
                    <div
                        key={quiz.id}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden transition-all"
                    >
                        {/* Header — always visible */}
                        <button
                            className="w-full text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                            onClick={() => setExpanded(isOpen ? null : quiz.id)}
                            aria-expanded={isOpen}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                                    {topMatch
                                        ? `Top match: ${topMatch.title}`
                                        : "Quiz in progress"}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                    {hasResults
                                        ? `${results.length} career matches`
                                        : "No results yet"}{" "}
                                    ·{" "}
                                    {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            {topMatch && (
                                <Badge variant="success" size="sm" className="shrink-0">
                                    {topMatch.matchScore}% match
                                </Badge>
                            )}
                            <svg
                                className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Expanded details */}
                        {isOpen && (
                            <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-5">
                                {/* Phase 1 answers summary */}
                                {phase1.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                            Your Profile
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {phase1.map((a, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                                                >
                                                    {a.answer}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Career results */}
                                {hasResults && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                                            Career Matches
                                        </p>
                                        <div className="space-y-3">
                                            {results.map((career, i) => (
                                                <div
                                                    key={career.id || i}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-semibold text-[var(--color-text)]">
                                                                {career.title}
                                                            </p>
                                                            <Badge variant="success" size="sm">
                                                                {career.matchScore}%
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                                                            {career.summary}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <span className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                                                                {formatSalary(career.salaryMin, career.salaryMax)}
                                                            </span>
                                                            <span className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                                                                {career.education}
                                                            </span>
                                                            {career.skills.slice(0, 3).map((s) => (
                                                                <span
                                                                    key={s}
                                                                    className="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
                                                                >
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-[var(--color-border)]">
                                    <Link
                                        href="/career-quiz"
                                        className="text-sm font-medium text-[var(--color-primary-600)] hover:underline"
                                    >
                                        Retake career quiz →
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
