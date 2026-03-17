"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { AnimatedScoreCircle, AnimatedProgressBar } from "@/components/ui/ScoreVisuals";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeAnalysisPayload {
    overallScore: number;
    subScores: {
        impact: number;
        skills: number;
        formatting: number;
    };
    markdownReport: string;
}

export function ResumeAnalysisOverviewSection({
    initialAnalysis
}: {
    initialAnalysis?: {
        data: ResumeAnalysisPayload;
        fileName: string;
    } | null
}) {
    const router = useRouter();
    const [resumeData, setResumeData] = useState<ResumeAnalysisPayload | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (initialAnalysis) {
            setResumeData(initialAnalysis.data);
            setFileName(initialAnalysis.fileName);
        }
    }, []);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch("/api/analyze-resume", { method: "DELETE" });
            setResumeData(null);
            setFileName(null);
            setConfirmDelete(false);
            setIsOpen(false);
            router.refresh();
        } catch {
            // silently ignore
        } finally {
            setDeleting(false);
        }
    };

    if (!resumeData) {
        return null;
    }

    return (
        <section className="space-y-4">
            <CardHeader
                title="Last Resume Analysis"
                description={fileName ? `Report for ${fileName}` : "Review your most recent ATS compatibility score."}
                action={
                    <div className="flex items-center gap-2">
                        <Link
                            href="/analyze"
                            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] transition-colors"
                        >
                            View Full Report
                        </Link>
                        {confirmDelete ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--color-text-muted)]">Delete this report?</span>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {deleting ? "Deleting…" : "Yes, delete"}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                title="Delete resume analysis"
                                className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" /><path d="M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                            </button>
                        )}
                    </div>
                }
            />

            {/* Parent accordion row */}
            <motion.div
                layout
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
                whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            >
                <button
                    className="w-full text-left p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                    onClick={() => setIsOpen((o) => !o)}
                    aria-expanded={isOpen}
                >
                    {/* Score badge icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                            {fileName ?? "Resume Analysis"}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            Overall score: <span className="font-semibold text-[var(--color-primary-600)]">{resumeData.overallScore}%</span>
                        </p>
                    </div>
                    <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </button>

                {/* Expanded score card */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="overflow-hidden"
                        >
                            <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 bg-[var(--color-background)]/40">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
                                    <div className="flex-shrink-0 flex items-center justify-center">
                                        <AnimatedScoreCircle score={resumeData.overallScore} label="Overall Match" />
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                                            <div className="scale-90 origin-left">
                                                <AnimatedProgressBar label="Impact & Results" score={resumeData.subScores.impact} />
                                            </div>
                                            <div className="scale-90 origin-left">
                                                <AnimatedProgressBar label="Skills Match" score={resumeData.subScores.skills} />
                                            </div>
                                            <div className="scale-90 origin-left">
                                                <AnimatedProgressBar label="Formatting" score={resumeData.subScores.formatting} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
}
