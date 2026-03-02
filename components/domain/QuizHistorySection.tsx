"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

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

export function QuizHistorySection({ quizzes: initialQuizzes }: { quizzes: QuizEntry[] }) {
    const [quizzes, setQuizzes] = useState<QuizEntry[]>(initialQuizzes);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    async function handleDelete() {
        if (!confirmDeleteId) return;
        const id = confirmDeleteId;
        setDeleting(id);
        try {
            const res = await fetch(`/api/career-quiz/${id}`, { method: "DELETE" });
            if (res.ok) {
                setQuizzes((prev) => prev.filter((q) => q.id !== id));
                if (expanded === id) setExpanded(null);
                setConfirmDeleteId(null);
            }
        } finally {
            setDeleting(null);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.21, 0.47, 0.32, 0.98],
            },
        },
    };

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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
        >
            <AnimatePresence mode="popLayout" initial={false}>
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
                    const isDeleting = deleting === quiz.id;

                    return (
                        <motion.div
                            key={quiz.id}
                            layout
                            variants={itemVariants}
                            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
                        >
                            {/* Header — always visible */}
                            <div className="flex items-center gap-2 pr-3">
                                <button
                                    className="flex-1 text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
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
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Badge variant="success" size="sm" className="shrink-0">
                                                {topMatch.matchScore}% match
                                            </Badge>
                                        </motion.div>
                                    )}
                                    <motion.svg
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
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
                                    </motion.svg>
                                </button>

                                {/* Delete button */}
                                <button
                                    onClick={() => setConfirmDeleteId(quiz.id)}
                                    disabled={isDeleting}
                                    title="Delete"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-5">
                                            {/* Phase 1 answers summary */}
                                            {phase1.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                                        Your Profile
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {phase1.map((a, i) => (
                                                            <motion.span
                                                                key={i}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: i * 0.03 }}
                                                                className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                                                            >
                                                                {a.answer}
                                                            </motion.span>
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
                                                            <motion.div
                                                                key={career.id || i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.05 }}
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
                                                            </motion.div>
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <ConfirmModal
                open={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Quiz Attempt"
                description="Are you sure you want to delete this quiz attempt? This action cannot be undone."
                confirmText="Delete"
                loading={!!deleting}
            />
        </motion.div>
    );
}
