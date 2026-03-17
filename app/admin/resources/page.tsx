"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AdminVerificationPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/resources");
            if (res.ok) {
                const data = await res.json();
                setResources(data.resources || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (resource_id: string, status: "approved" | "rejected") => {
        try {
            const res = await fetch("/api/admin/resources/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resource_id, status })
            });

            if (res.ok) {
                const updated = await res.json();
                setResources(prev =>
                    prev.map(r => r.id === resource_id ? { ...r, status: updated.status } : r)
                );
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            alert("Error updating status");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Resource Verification</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Review and verify videos, articles, and courses submitted by Providers.
                </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[var(--color-text)]">
                        <thead className="bg-[var(--color-background)] font-medium text-[var(--color-text-muted)]">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border)]">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">Loading...</td>
                                </tr>
                            )}
                            {!loading && resources.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-muted)]">No resources submitted yet.</td>
                                </tr>
                            )}
                            {!loading && resources.map((r) => (
                                <React.Fragment key={r.id}>
                                    <tr className="hover:bg-[var(--color-background)]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{r.title || r.courseTitle}</td>
                                        <td className="px-6 py-4 capitalize">{r.resourceType}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{r.submittedBy?.name || "Unknown"}</span>
                                                <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                    {r.submittedBy?.role} {r.submittedBy?.organizationName ? `(${r.submittedBy.organizationName})` : ""}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.status === "pending" && <Badge variant="warning">Pending</Badge>}
                                            {r.status === "approved" && <Badge variant="success">Approved</Badge>}
                                            {r.status === "rejected" && <Badge variant="error" className="bg-red-100 text-red-700">Rejected</Badge>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button
                                                    onClick={() => setExpandedId(prev => prev === r.id ? null : r.id)}
                                                    className="inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    {expandedId === r.id ? "Hide Details" : "View"}
                                                </button>
                                                {r.status !== "approved" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(r.id, "approved")}
                                                        className="inline-flex items-center justify-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {r.status !== "rejected" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(r.id, "rejected")}
                                                        className="inline-flex items-center justify-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === r.id && (
                                        <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-4 max-h-[400px] overflow-y-auto">
                                                    <h4 className="font-semibold mb-2">Description</h4>
                                                    <p className="text-sm text-[var(--color-text-muted)] mb-4">{r.description || r.courseDescription || "No description provided."}</p>

                                                    {r.resourceType === "video" && r.videoFilePath && (
                                                        <div className="mt-4">
                                                            <h4 className="font-semibold mb-2">Video File</h4>
                                                            <video src={r.videoFilePath} controls className="max-h-[300px] w-auto border rounded" />
                                                            <p className="text-xs text-gray-400 mt-2">Duration: {r.durationSeconds ? `${r.durationSeconds} sec` : 'Unknown'}</p>
                                                        </div>
                                                    )}

                                                    {r.resourceType === "article" && r.articleContent && (
                                                        <div className="mt-4">
                                                            <h4 className="font-semibold mb-2">Article Content</h4>
                                                            <div className="text-sm whitespace-pre-wrap rounded bg-gray-50 dark:bg-gray-800/50 p-3 italic">
                                                                {r.articleContent}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {r.resourceType === "course" && (
                                                        <div className="mt-4">
                                                            <h4 className="font-semibold mb-2">Course Details</h4>
                                                            <ul className="text-sm list-disc pl-4 text-[var(--color-text-muted)]">
                                                                <li>Level: {r.level}</li>
                                                                <li>Duration: {r.totalDuration} minutes</li>
                                                                <li>Certificate: {r.certificateAvailable ? 'Yes' : 'No'}</li>
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
