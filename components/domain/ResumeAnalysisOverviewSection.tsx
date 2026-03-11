"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { AnimatedScoreCircle, AnimatedProgressBar } from "@/components/ui/ScoreVisuals";

// Reusing payload interface from the Analyze page for type safety
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
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (initialAnalysis) {
            setResumeData(initialAnalysis.data);
            setFileName(initialAnalysis.fileName);
        }
        // Do NOT fall back to localStorage — it is shared across users on the
        // same browser and would leak another user's resume data.
    }, []);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch("/api/analyze-resume", { method: "DELETE" });
            setResumeData(null);
            setFileName(null);
            setConfirmDelete(false);
            // Refresh server-side data
            router.refresh();
        } catch {
            // silently ignore
        } finally {
            setDeleting(false);
        }
    };

    if (!resumeData) {
        return null; // Don't render anything if there's no analysis data available
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
                            className="inline-flex items-center justify-center rounded-lg border border-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)] dark:hover:bg-opacity-20 transition-colors"
                        >
                            View Full Report
                        </Link>

                        {/* Delete button / confirm flow */}
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
                                className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 transition-colors"
                            >
                                {/* Trash icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                            </button>
                        )}
                    </div>
                }
            />
            <Card padding="lg" className="w-full bg-white dark:bg-[var(--color-card)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">

                    {/* Main Score - Left */}
                    <div className="flex-shrink-0 flex items-center justify-center translate-y-[-10px] md:translate-y-0">
                        <AnimatedScoreCircle score={resumeData.overallScore} label="Overall Match" />
                    </div>

                    {/* Sub-Metrics - Right */}
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
            </Card>
        </section>
    );
}
