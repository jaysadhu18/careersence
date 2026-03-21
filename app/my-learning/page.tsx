"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import Link from "next/link";
import { BookOpenIcon, CheckCircleIcon } from "lucide-react";

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enrollments")
      .then((r) => r.json())
      .then((d) => setEnrollments(d.enrollments || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="My Learning"
      description="All courses you are enrolled in."
    >
      {loading ? (
        <p className="text-[var(--color-text-muted)]">Loading your courses...</p>
      ) : enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-16 text-center text-[var(--color-text-muted)]">
          <BookOpenIcon className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="text-lg font-medium">No courses yet</p>
          <p className="mt-1 text-sm">Browse the learning module to find and enroll in courses.</p>
          <Link href="/learning-resources" className="mt-4 inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => {
            const course = e.course;
            const totalLectures = course?.sections?.reduce((a: number, s: any) => a + s.lectures.length, 0) || 0;
            return (
              <Link href={`/courses/${course.id}`} key={e.id}>
                <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-md)] hover:border-[var(--color-primary-400)] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-[var(--color-primary-100)] p-2 text-[var(--color-primary-600)]">
                      <BookOpenIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary-600)] line-clamp-2">{course.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">By {course.author?.name || "Instructor"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>{totalLectures} lectures</span>
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Enrolled
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
