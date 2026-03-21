"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export default function SubmissionHistoryPage() {
    const { data: session } = useSession();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        fetch("/api/resource-provider/my-submissions?userId=" + session.user.id)
            .then((r) => r.json())
            .then((d) => setHistory(d.resources || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [session?.user?.id]);

    return (
        <PageShell title="Submission History" description="Full details of your submitted learning resources.">
            <div className="mx-auto max-w-2xl space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--color-text-muted)]">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading...
                    </div>
                ) : history.length === 0 ? (
                    <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">No submissions found.</p>
                ) : history.map((r) => (
                    <Card key={r.id} padding="md">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="font-bold text-[var(--color-text)]">{r.title || r.courseTitle}</h3>
                                <p className="text-xs capitalize text-[var(--color-text-muted)] mt-0.5">{r.resourceType}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                                r.status === "approved" ? "bg-emerald-500/10 text-emerald-500"
                                : r.status === "rejected" ? "bg-red-500/10 text-red-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}>
                                {r.status}
                            </span>
                        </div>

                        {/* Common fields */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {r.description && <Field label="Description" value={r.description} full />}
                            {r.language && <Field label="Language" value={r.language} />}
                            {r.level && <Field label="Level" value={r.level} />}

                            {/* Video */}
                            {r.durationSeconds && <Field label="Duration" value={Math.round(r.durationSeconds / 60) + " min"} />}
                            {r.resolution && <Field label="Resolution" value={r.resolution} />}

                            {/* Article */}
                            {r.readTimeMinutes && <Field label="Read Time" value={r.readTimeMinutes + " min"} />}
                            {r.summary && <Field label="Summary" value={r.summary} full />}
                            {r.tags && <Field label="Tags" value={r.tags} />}

                            {/* Course */}
                            {r.courseTitle && r.title !== r.courseTitle && <Field label="Course Title" value={r.courseTitle} />}
                            {r.courseDescription && <Field label="Course Description" value={r.courseDescription} full />}
                            {r.totalDuration && <Field label="Total Duration" value={r.totalDuration + " min"} />}
                            {r.certificateAvailable !== null && r.certificateAvailable !== undefined && (
                                <Field label="Certificate" value={r.certificateAvailable ? "Yes" : "No"} />
                            )}

                            <Field label="Submitted" value={new Date(r.createdAt).toLocaleDateString()} />
                        </div>
                    </Card>
                ))}
            </div>
        </PageShell>
    );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
    return (
        <div className={full ? "col-span-2" : ""}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">{label}</p>
            <p className="text-sm text-[var(--color-text)]">{value}</p>
        </div>
    );
}
