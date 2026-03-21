"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const res = await fetch("/api/instructor/courses");
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  };

  const createCourse = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/instructor/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: "", price: 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      setCourses((prev) => [data.course, ...prev]);
      setNewTitle("");
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <PageShell
      title="Instructor Dashboard"
      description="Manage your courses, build curriculum, and track submissions."
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-text)]">My Courses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-5 text-sm font-semibold text-white shadow hover:bg-[var(--color-primary-700)] transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> New Course
        </button>
      </div>

      {showForm && (
        <Card padding="md" className="mb-6 border-[var(--color-primary-300)]">
          <h3 className="font-semibold mb-3">Create New Course</h3>
          <div className="flex gap-3">
            <input
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary-500)]"
              placeholder="Course title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCourse()}
            />
            <button
              onClick={createCourse}
              disabled={creating}
              className="rounded-lg bg-[var(--color-primary-600)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-[var(--color-border)] px-4 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]">
              Cancel
            </button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-[var(--color-text-muted)]">Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-16 text-center text-[var(--color-text-muted)]">
          <p className="text-lg font-medium">No courses yet</p>
          <p className="mt-1 text-sm">Click "New Course" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link href={`/learning-resources/instructor/courses/${c.id}`} key={c.id}>
              <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-400)] transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary-600)] line-clamp-2">{c.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[c.status] || "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{c.sections?.length || 0} sections · {c.sections?.reduce((acc: number, s: any) => acc + (s.lectures?.length || 0), 0)} lectures</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
