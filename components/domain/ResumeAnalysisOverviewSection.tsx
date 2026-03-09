"use client";

import { useEffect, useState } from "react";
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
    const [resumeData, setResumeData] = useState<ResumeAnalysisPayload | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    useEffect(() => {
        if (initialAnalysis) {
            setResumeData(initialAnalysis.data);
            setFileName(initialAnalysis.fileName);
            return;
        }

        // Only access localStorage on the client side
        const savedData = localStorage.getItem("resumeAnalysisData");
        const savedName = localStorage.getItem("resumeFileName");

        if (savedData) {
            try {
                setResumeData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse saved resume data for overview");
            }
        }

        if (savedName) {
            setFileName(savedName);
        }
    }, []);

    if (!resumeData) {
        return null; // Don't render anything if there's no analysis data available
    }

    return (
        <section className="space-y-4">
            <CardHeader
                title="Last Resume Analysis"
                description={fileName ? `Report for ${fileName}` : "Review your most recent ATS compatibility score."}
                action={
                    <Link
                        href="/analyze"
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)] dark:hover:bg-opacity-20 transition-colors"
                    >
                        View Full Report
                    </Link>
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
