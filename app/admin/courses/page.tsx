"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function AdminCourseModerationPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/courses/pending");
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  };

  const verify = async (courseId: string, status: "PUBLISHED" | "REJECTED") => {
    setActioning(courseId);
    const res = await fetch(`/api/admin/courses/${courseId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setActioning(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Course Moderation</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Review and publish or reject courses submitted by instructors.</p>
      </div>

      {loading && <p className="text-[var(--color-text-muted)]">Loading...</p>}
      {!loading && courses.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center text-[var(--color-text-muted)]">
          <p className="text-lg font-medium">All clear! 🎉</p>
          <p className="text-sm mt-1">No courses pending review.</p>
        </div>
      )}

      <div className="space-y-4">
        {courses.map((c) => {
          const totalLectures = c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0);
          return (
            <Card key={c.id} padding="md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-[var(--color-text)]">{c.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    By: <strong>{c.author?.name}</strong> ({c.author?.role}{c.author?.organizationName ? ` · ${c.author.organizationName}` : ""})
                    &nbsp;·&nbsp; {c.sections?.length} sections &nbsp;·&nbsp; {totalLectures} lectures
                    &nbsp;·&nbsp; Price: <strong>{c.price === 0 ? "Free" : `$${c.price}`}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpandedId(prev => prev === c.id ? null : c.id)} className="rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors">
                    {expandedId === c.id ? "Hide" : "Preview"}
                  </button>
                  <button
                    disabled={actioning === c.id}
                    onClick={() => verify(c.id, "PUBLISHED")}
                    className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors disabled:opacity-60"
                  >Publish</button>
                  <button
                    disabled={actioning === c.id}
                    onClick={() => verify(c.id, "REJECTED")}
                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors disabled:opacity-60"
                  >Reject</button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-3">
                  <p className="text-sm text-[var(--color-text)]">{c.description || "No description."}</p>
                  {c.sections?.map((s: any) => (
                    <div key={s.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                      <p className="text-sm font-semibold mb-2">📂 {s.title}</p>
                      <div className="space-y-1.5">
                        {s.lectures?.map((l: any) => (
                          <div key={l.id} className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                            <span className="uppercase font-medium text-[var(--color-primary-500)]">{l.type}</span>
                            <span>{l.title}</span>
                            {l.contentUrl && (
                              l.type === "VIDEO"
                                ? <video src={l.contentUrl} controls className="max-h-[180px] rounded border mt-1" />
                                : <a href={l.contentUrl} target="_blank" className="text-[var(--color-primary-600)] hover:underline">View File</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
