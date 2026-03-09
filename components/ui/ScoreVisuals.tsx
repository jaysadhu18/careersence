"use client";

import { motion } from "framer-motion";

export function AnimatedScoreCircle({ score, label }: { score: number; label: string }) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    // Ensure we don't drop below 0
    const safeScore = Math.max(0, Math.min(100, score));
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;

    let colorClass = "text-red-500";
    let bgClass = "text-red-100 dark:text-red-900 dark:text-opacity-30";
    if (safeScore >= 80) {
        colorClass = "text-green-500";
        bgClass = "text-green-100 dark:text-green-900 dark:text-opacity-30";
    } else if (safeScore >= 60) {
        colorClass = "text-yellow-500";
        bgClass = "text-yellow-100 dark:text-yellow-900 dark:text-opacity-30";
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative flex h-40 w-40 items-center justify-center drop-shadow-sm">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 140 140">
                    {/* Background Circle */}
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className={bgClass}
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeLinecap="round"
                        className={colorClass}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <motion.span
                        className="text-4xl font-extrabold text-[var(--color-text)]"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        {safeScore}
                    </motion.span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        / 100
                    </span>
                </div>
            </div>
            <span className="mt-4 text-base font-bold text-[var(--color-text)] tracking-tight">{label}</span>
        </div>
    );
}

export function AnimatedProgressBar({ label, score }: { label: string; score: number }) {
    const safeScore = Math.max(0, Math.min(100, score));
    let colorClass = "bg-red-500";
    if (safeScore >= 80) colorClass = "bg-green-500";
    else if (safeScore >= 60) colorClass = "bg-yellow-500";

    return (
        <div className="mb-5 w-full">
            <div className="mb-2 flex justify-between items-end">
                <span className="text-sm font-semibold text-[var(--color-text)]">{label}</span>
                <span className="text-xs font-extrabold text-[var(--color-text-muted)]">{safeScore}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-border)] shadow-inner">
                <motion.div
                    className={`h-full rounded-full ${colorClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${safeScore}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                />
            </div>
        </div>
    );
}
