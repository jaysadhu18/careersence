"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

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

export function RoadmapHistorySection({ roadmaps: initialRoadmaps }: { roadmaps: RoadmapEntry[] }) {
    const [roadmaps, setRoadmaps] = useState<RoadmapEntry[]>(initialRoadmaps);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    async function handleDelete() {
        if (!confirmDeleteId) return;
        const id = confirmDeleteId;
        setDeleting(id);
        try {
            const res = await fetch(`/api/roadmap/${id}`, { method: "DELETE" });
            if (res.ok) {
                setRoadmaps((prev) => prev.filter((r) => r.id !== id));
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
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {roadmaps.map((rm) => {
                    let stages: Stage[] = [];
                    try {
                        stages = JSON.parse(rm.stages) as Stage[];
                    } catch {
                        stages = [];
                    }
                    const isOpen = expanded === rm.id;
                    const isDeleting = deleting === rm.id;

                    return (
                        <motion.div
                            key={rm.id}
                            layout
                            variants={itemVariants}
                            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
                        >
                            {/* Card Header — always visible */}
                            <div className="flex items-center gap-2 pr-3">
                                <button
                                    className="flex-1 text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                                    onClick={() => setExpanded(isOpen ? null : rm.id)}
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 0 002 2h2a2 0 002-2M9 5a2 0 012-2h2a2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{rm.careerGoal}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                            {stages.length} stages · {new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                    <motion.svg
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                </button>

                                {/* Delete button */}
                                <button
                                    onClick={() => setConfirmDeleteId(rm.id)}
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

                            {/* Expanded stages */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-4">
                                            {stages.map((stage, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex gap-3"
                                                >
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
                                                </motion.div>
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
                title="Delete Roadmap"
                description="Are you sure you want to delete this roadmap? This action cannot be undone."
                confirmText="Delete"
                loading={!!deleting}
            />
        </motion.div>
    );
}
