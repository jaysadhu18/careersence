"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { PlusIcon, ChevronDownIcon, ChevronUpIcon, UploadIcon, VideoIcon, FileTextIcon, HelpCircleIcon } from "lucide-react";

const typeIcons: Record<string, any> = {
  VIDEO: VideoIcon,
  PDF: FileTextIcon,
  QUIZ: HelpCircleIcon,
};

export default function CourseBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Section form
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Lecture form state per-section
  const [lectureFormSectionId, setLectureFormSectionId] = useState<string | null>(null);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureType, setLectureType] = useState("VIDEO");
  const [lectureFile, setLectureFile] = useState<File | null>(null);
  const [lectureText, setLectureText] = useState("");
  const [addingLecture, setAddingLecture] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => { fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    const res = await fetch(`/api/instructor/courses/${id}`);
    const data = await res.json();
    setCourse(data.course);
    // Expand all sections by default
    if (data.course?.sections) {
      setExpandedSections(new Set(data.course.sections.map((s: any) => s.id)));
    }
    setLoading(false);
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    setAddingSection(true);
    const res = await fetch(`/api/instructor/courses/${id}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSectionTitle }),
    });
    if (res.ok) { await fetchCourse(); setNewSectionTitle(""); }
    setAddingSection(false);
  };

  const addLecture = async (sectionId: string) => {
    if (!lectureTitle.trim()) return;
    setAddingLecture(true);
    const formData = new FormData();
    formData.append("title", lectureTitle);
    formData.append("type", lectureType);
    if (lectureFile) formData.append("file", lectureFile);
    if (lectureText) formData.append("textContent", lectureText);

    const res = await fetch(`/api/sections/${sectionId}/lectures`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      await fetchCourse();
      setLectureTitle(""); setLectureType("VIDEO"); setLectureFile(null); setLectureText("");
      setLectureFormSectionId(null);
    }
    setAddingLecture(false);
  };

  const submitForReview = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/instructor/courses/${id}/submit`, { method: "POST" });
    const data = await res.json();
    if (res.ok) { setCourse((c: any) => ({ ...c, status: data.course.status })); }
    else alert(data.error);
    setSubmitting(false);
  };

  const toggleSection = (sid: string) => {
    setExpandedSections((prev) => { const n = new Set(prev); n.has(sid) ? n.delete(sid) : n.add(sid); return n; });
  };

  if (loading) return <PageShell title="Course Builder"><p className="text-[var(--color-text-muted)]">Loading...</p></PageShell>;
  if (!course) return <PageShell title="Course Builder"><p className="text-red-500">Course not found.</p></PageShell>;

  const isEditable = course.status === "DRAFT" || course.status === "REJECTED";
  const statusColors: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-600", PENDING: "bg-yellow-100 text-yellow-700", PUBLISHED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700" };

  return (
    <PageShell title={course.title} description={`Status: ${course.status}`}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[course.status]}`}>{course.status}</span>
        {isEditable && (
          <button onClick={submitForReview} disabled={submitting} className="ml-auto rounded-lg bg-[var(--color-primary-600)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60 transition-colors">
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        )}
        {course.status === "PENDING" && <p className="ml-auto text-sm text-yellow-600 font-medium">⏳ Under admin review — editing locked</p>}
        {course.status === "PUBLISHED" && <p className="ml-auto text-sm text-green-600 font-medium">✅ Live and visible to students</p>}
      </div>

      {/* Sections list */}
      <div className="space-y-4">
        {course.sections?.map((section: any) => (
          <Card key={section.id} padding="md">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(section.id)}>
              <h3 className="font-semibold text-[var(--color-text)]">📂 {section.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">{section.lectures?.length || 0} lectures</span>
                {expandedSections.has(section.id) ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              </div>
            </div>

            {expandedSections.has(section.id) && (
              <div className="mt-4 space-y-2">
                {section.lectures?.map((lec: any) => {
                  const Icon = typeIcons[lec.type] || FileTextIcon;
                  return (
                    <div key={lec.id} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-sm">
                      <Icon className="h-4 w-4 text-[var(--color-primary-500)]" />
                      <span className="flex-1 text-[var(--color-text)]">{lec.title}</span>
                      <span className="text-xs text-[var(--color-text-muted)] uppercase">{lec.type}</span>
                      {lec.contentUrl && <a href={lec.contentUrl} target="_blank" className="text-xs text-[var(--color-primary-600)] hover:underline">View</a>}
                    </div>
                  );
                })}

                {isEditable && (
                  <>
                    {lectureFormSectionId === section.id ? (
                      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
                        <div className="flex gap-3">
                          <input className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none" placeholder="Lecture title" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} />
                          <select className="rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)]" value={lectureType} onChange={(e) => setLectureType(e.target.value)}>
                            <option value="VIDEO">Video</option>
                            <option value="PDF">PDF</option>
                            <option value="QUIZ">Quiz/Text</option>
                          </select>
                        </div>
                        {(lectureType === "VIDEO" || lectureType === "PDF") && (
                          <div>
                            <label className="text-xs font-medium text-[var(--color-text-muted)] mb-1 block">Upload File</label>
                            <input type="file" accept={lectureType === "VIDEO" ? "video/*" : "application/pdf"} className="text-sm text-[var(--color-text-muted)]" onChange={(e) => setLectureFile(e.target.files?.[0] || null)} />
                          </div>
                        )}
                        {lectureType === "QUIZ" && (
                          <textarea className="w-full rounded border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none min-h-[80px]" placeholder="Enter quiz content or text..." value={lectureText} onChange={(e) => setLectureText(e.target.value)} />
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => addLecture(section.id)} disabled={addingLecture} className="rounded-md bg-[var(--color-primary-600)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60">{addingLecture ? "Saving..." : "Save Lecture"}</button>
                          <button onClick={() => setLectureFormSectionId(null)} className="rounded-md border border-[var(--color-border)] px-4 py-1.5 text-xs text-[var(--color-text-muted)]">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setLectureFormSectionId(section.id); setLectureTitle(""); setLectureType("VIDEO"); }} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary-600)] hover:underline">
                        <PlusIcon className="h-3.5 w-3.5" /> Add Lecture
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Section */}
      {isEditable && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--color-border)] p-6">
          <p className="mb-3 text-sm font-medium text-[var(--color-text)]">Add New Section</p>
          <div className="flex gap-3">
            <input className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary-500)]" placeholder="Section title..." value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSection()} />
            <button onClick={addSection} disabled={addingSection} className="rounded-lg bg-[var(--color-primary-600)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)] disabled:opacity-60">{addingSection ? "Adding..." : "Add Section"}</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
