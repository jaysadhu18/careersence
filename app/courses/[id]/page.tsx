"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { CheckCircle, Circle, VideoIcon, FileTextIcon, HelpCircleIcon } from "lucide-react";

const typeIcons: Record<string, any> = {
  VIDEO: VideoIcon,
  PDF: FileTextIcon,
  QUIZ: HelpCircleIcon,
};

export default function CourseLearnerPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => { fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    const res = await fetch(`/api/instructor/courses/${id}`);
    const data = await res.json();
    setCourse(data.course);

    // Check enrollment
    const eRes = await fetch(`/api/enrollments`);
    const eData = await eRes.json();
    const myEnrollment = (eData.enrollments || []).find((e: any) => e.courseId === id);
    setEnrollment(myEnrollment);

    // Set first lecture as default
    const firstLec = data.course?.sections?.[0]?.lectures?.[0];
    if (firstLec) setActiveLecture(firstLec);
    setLoading(false);
  };

  const enroll = async () => {
    setEnrolling(true);
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: id }),
    });
    if (res.ok) await fetchCourse();
    setEnrolling(false);
  };

  const markComplete = async (lectureId: string, isComplete: boolean) => {
    await fetch(`/api/progress/${lectureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isComplete }),
    });
    setCompletedIds((prev) => {
      const n = new Set(prev);
      isComplete ? n.add(lectureId) : n.delete(lectureId);
      return n;
    });
  };

  const totalLectures = course?.sections?.reduce((a: number, s: any) => a + s.lectures.length, 0) || 0;
  const progressPct = totalLectures > 0 ? Math.round((completedIds.size / totalLectures) * 100) : 0;

  if (loading) return <PageShell title="Loading..."><p className="text-[var(--color-text-muted)]">Loading course...</p></PageShell>;
  if (!course) return <PageShell title="Not Found"><p className="text-red-500">Course not found.</p></PageShell>;

  return (
    <PageShell title={course.title} description={`By ${course.author?.name || "Instructor"}`} maxWidth="xl">
      {!enrollment ? (
        /* Course Landing Page */
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {course.coverImage && <img src={course.coverImage} alt={course.title} className="w-full h-64 object-cover rounded-xl" />}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">{course.title}</h1>
            <p className="text-[var(--color-text-muted)]">{course.description}</p>
          </div>
          <div className="flex justify-center gap-8 text-sm text-[var(--color-text-muted)]">
            <span><strong>{course.sections?.length}</strong> sections</span>
            <span><strong>{totalLectures}</strong> lectures</span>
            <span><strong>{course.price === 0 ? "Free" : `$${course.price}`}</strong></span>
          </div>
          <button onClick={enroll} disabled={enrolling} className="w-full max-w-sm rounded-xl bg-[var(--color-primary-600)] py-3 text-base font-bold text-white hover:bg-[var(--color-primary-700)] transition-colors disabled:opacity-60">
            {enrolling ? "Enrolling..." : course.price === 0 ? "Enroll for Free" : `Enroll – $${course.price}`}
          </button>
          {/* Curriculum preview */}
          <div className="text-left mt-8 space-y-2">
            <h3 className="font-semibold text-[var(--color-text)]">Curriculum</h3>
            {course.sections?.map((s: any) => (
              <details key={s.id} className="rounded-lg border border-[var(--color-border)] p-3">
                <summary className="cursor-pointer font-medium text-sm text-[var(--color-text)]">📂 {s.title} ({s.lectures.length} lectures)</summary>
                <ul className="mt-2 space-y-1 pl-4">
                  {s.lectures.map((l: any) => {
                    const Icon = typeIcons[l.type] || FileTextIcon;
                    return <li key={l.id} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><Icon className="h-3 w-3" />{l.title}</li>;
                  })}
                </ul>
              </details>
            ))}
          </div>
        </div>
      ) : (
        /* Course Player */
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main player area */}
          <div className="flex-1 min-w-0">
            {activeLecture ? (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-black">
                  {activeLecture.type === "VIDEO" && activeLecture.contentUrl && <video src={activeLecture.contentUrl} controls className="w-full max-h-[480px]" />}
                  {activeLecture.type === "PDF" && activeLecture.contentUrl && <iframe src={activeLecture.contentUrl} className="w-full h-[480px]" />}
                  {(activeLecture.type === "QUIZ" || !activeLecture.contentUrl) && (
                    <div className="p-8 text-white">
                      <h3 className="text-xl font-bold mb-4">{activeLecture.title}</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">{activeLecture.textContent || "No content available."}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">{activeLecture.title}</h2>
                  <button
                    onClick={() => markComplete(activeLecture.id, !completedIds.has(activeLecture.id))}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${completedIds.has(activeLecture.id) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-green-50"}`}
                  >
                    {completedIds.has(activeLecture.id) ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    {completedIds.has(activeLecture.id) ? "Completed" : "Mark Complete"}
                  </button>
                </div>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Progress</span><span>{progressPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--color-border)]">
                    <div className="h-2 rounded-full bg-[var(--color-primary-500)] transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
            ) : <p className="text-[var(--color-text-muted)]">Select a lecture to begin.</p>}
          </div>

          {/* Sidebar curriculum */}
          <aside className="w-full lg:w-80 shrink-0 space-y-2">
            <h3 className="font-semibold text-sm text-[var(--color-text)]">Course Content</h3>
            {course.sections?.map((s: any) => (
              <div key={s.id} className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                <div className="bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold text-[var(--color-text)]">📂 {s.title}</div>
                {s.lectures?.map((l: any) => {
                  const Icon = typeIcons[l.type] || FileTextIcon;
                  const done = completedIds.has(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActiveLecture(l)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${activeLecture?.id === l.id ? "bg-[var(--color-primary-100)] text-[var(--color-primary-700)]" : "hover:bg-[var(--color-background)] text-[var(--color-text)]"}`}
                    >
                      {done ? <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" /> : <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />}
                      <span className="line-clamp-2 flex-1">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        </div>
      )}
    </PageShell>
  );
}
