"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { Resource } from "@/lib/hooks/useResources";

export function SavedResourcesSection({ initialResources }: { initialResources: Resource[] }) {
    const [resources, setResources] = useState<Resource[]>(initialResources);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleUnsave = async () => {
        if (!confirmDeleteId) return;
        const resourceId = confirmDeleteId;
        setDeleting(resourceId);

        try {
            const res = await fetch(`/api/learning/saved?resourceId=${encodeURIComponent(resourceId)}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setResources((prev) => prev.filter((r) => r.id !== resourceId));
                if (expanded === resourceId) setExpanded(null);
                setConfirmDeleteId(null);
            }
        } catch (err) {
            console.error("Failed to unsave resource", err);
        } finally {
            setDeleting(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
        },
    };

    if (resources.length === 0) {
        return (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
                <p className="font-medium text-[var(--color-text)]">No saved learning resources.</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Head over to the Learning center to discover and save resources.
                </p>
            </div>
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
                {resources.map((resource) => {
                    const isOpen = expanded === resource.id;
                    const isDeleting = deleting === resource.id;

                    return (
                        <motion.div
                            key={resource.id}
                            layout
                            variants={itemVariants}
                            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="flex items-center gap-2 pr-3">
                                <button
                                    className="flex-1 text-left p-4 sm:p-5 flex items-center gap-3 hover:bg-[var(--color-primary-50)] transition-colors"
                                    onClick={() => setExpanded(isOpen ? null : resource.id)}
                                    aria-expanded={isOpen}
                                >
                                    {/* Icon */}
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {resource.type === "video" ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            )}
                                        </svg>
                                    </div>
                                    {/* Title + meta */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                                            {resource.title}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                                            <span className="capitalize">{resource.type}</span>
                                            <span>•</span>
                                            <span>{resource.source}</span>
                                        </div>
                                    </div>
                                    {/* Chevron */}
                                    <motion.svg
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] hidden sm:block"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                </button>

                                {/* Delete button (Unsave) */}
                                <button
                                    onClick={() => setConfirmDeleteId(resource.id)}
                                    disabled={isDeleting}
                                    title="Unsave Resource"
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

                            {/* Expanded Detail */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-4 space-y-4 bg-[var(--color-background)]/50">
                                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                                {resource.description || "No description available for this resource."}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="primary" size="sm">{resource.type}</Badge>
                                                <Badge variant="outline" size="sm" className="capitalize">{resource.level || "All Levels"}</Badge>
                                                <Badge variant="outline" size="sm">{resource.source}</Badge>
                                            </div>

                                            <div className="pt-2 flex flex-wrap gap-3">
                                                <Link
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)] transition-colors"
                                                >
                                                    Open Resource
                                                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
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
                onConfirm={handleUnsave}
                title="Unsave Resource"
                description="Are you sure you want to unsave this learning resource? It will be removed from your dashboard."
                confirmText="Unsave"
                loading={!!deleting}
            />
        </motion.div>
    );
}
