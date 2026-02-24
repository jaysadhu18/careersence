"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { RoadmapStepCard } from "@/components/domain/RoadmapStepCard";
import type { RoadmapStage, StageStatus } from "@/lib/hooks/useRoadmap";

type View = "questions" | "loading" | "roadmap";

interface FormAnswers {
  careerGoal: string;
  currentStage: string;
  timeline: string;
  experience: string;
  interests: string;
}

const initialAnswers: FormAnswers = {
  careerGoal: "",
  currentStage: "",
  timeline: "",
  experience: "",
  interests: "",
};

function mapApiStageToRoadmapStage(
  s: { title: string; description: string; timeRange: string; actions: string[]; resources?: string[] },
  i: number
): RoadmapStage {
  return {
    id: `gen-${i}`,
    title: s.title,
    description: s.description,
    timeRange: s.timeRange,
    status: "not_started",
    actions: s.actions,
    resourceIds: s.resources ?? [],
  };
}

export default function AIRoadmapPage() {
  const [view, setView] = useState<View>("questions");
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [error, setError] = useState("");
  const [stages, setStages] = useState<RoadmapStage[]>([]);

  const setStageStatus = (stageId: string, status: StageStatus) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, status } : s))
    );
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const totalActions = stages.reduce((acc, s) => acc + s.actions.length, 0);
  const completedActions = stages.reduce(
    (acc, s) => acc + (s.status === "completed" ? s.actions.length : 0),
    0
  );
  const progressPct = totalActions ? Math.round((completedActions / totalActions) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!answers.careerGoal.trim()) {
      setError("Please enter your career goal.");
      return;
    }
    setView("loading");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.details || "Failed to generate roadmap");
        setView("questions");
        return;
      }
      const mapped = (data.stages ?? []).map(mapApiStageToRoadmapStage);
      setStages(mapped);
      setView("roadmap");
    } catch {
      setError("Network error. Please try again.");
      setView("questions");
    }
  };

  const startOver = () => {
    setView("questions");
    setAnswers(initialAnswers);
    setStages([]);
    setError("");
  };

  return (
    <PageShell
      title="Your AI Roadmap"
      description={
        view === "questions"
          ? "Answer a few career-related questions and we'll generate a detailed roadmap to reach your goal."
          : "Your personalized step-by-step path. Mark stages as you complete them."
      }
      maxWidth="xl"
    >
      {view === "questions" && (
        <Card padding="lg" className="mx-auto max-w-2xl border-2 border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] shadow-[var(--shadow-lg)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Tell us about your goal
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                We'll use AI to build a detailed roadmap tailored to you.
              </p>
            </div>
          </div>
          {error && (
            <div
              className="mb-4 rounded-lg border border-[var(--color-error)] bg-red-50 p-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Career goal"
              placeholder="e.g. Become a software engineer, Get into data analytics, Switch to product management"
              value={answers.careerGoal}
              onChange={(e) => setAnswers((a) => ({ ...a, careerGoal: e.target.value }))}
              required
            />
            <Input
              label="Current stage"
              placeholder="e.g. Student, Just graduated, Working in unrelated field, Self-learning"
              value={answers.currentStage}
              onChange={(e) => setAnswers((a) => ({ ...a, currentStage: e.target.value }))}
            />
            <Input
              label="Timeline"
              placeholder="e.g. 6 months, 1 year, No fixed deadline"
              value={answers.timeline}
              onChange={(e) => setAnswers((a) => ({ ...a, timeline: e.target.value }))}
            />
            <Textarea
              label="Current experience & skills"
              placeholder="Briefly describe your background, relevant skills, courses, or projects."
              value={answers.experience}
              onChange={(e) => setAnswers((a) => ({ ...a, experience: e.target.value }))}
              rows={3}
            />
            <Textarea
              label="Interests & constraints"
              placeholder="e.g. Prefer remote work, interested in startups, need to balance with full-time job"
              value={answers.interests}
              onChange={(e) => setAnswers((a) => ({ ...a, interests: e.target.value }))}
              rows={2}
            />
            <Button type="submit" variant="primary" fullWidth>
              Generate my roadmap
            </Button>
          </form>
        </Card>
      )}

      {view === "loading" && (
        <Card padding="lg" className="relative mx-auto max-w-md overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)]/50 to-[var(--color-secondary-50)]/50 pointer-events-none" aria-hidden />
          <div className="relative z-10">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] opacity-20 animate-pulse" />
                <svg
                  className="absolute inset-0 m-auto h-10 w-10 animate-spin text-[var(--color-primary-600)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
            <p className="mt-6 font-semibold text-[var(--color-text)]">
              Generating your roadmap...
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              This usually takes 10–30 seconds.
            </p>
            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-[var(--color-primary-400)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </Card>
      )}

      {view === "roadmap" && (
        <>
          {/* Progress hero */}
          <div className="mb-10 rounded-2xl border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-50)] via-[var(--color-surface)] to-[var(--color-secondary-50)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                    <path
                      className="text-[var(--color-border)]"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="roadmap-progress-ring text-[var(--color-primary-500)]"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{
                        strokeDashoffset: 100 - progressPct,
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--color-primary-600)]">
                    {progressPct}%
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Your progress
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {completedCount} of {stages.length} stages · {completedActions} of {totalActions} actions done
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={startOver}>
                  Start over
                </Button>
                <Link
                  href="/career-quiz"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary-600)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
                >
                  Update from quiz →
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-6 bottom-6 w-0.5 rounded-full roadmap-timeline-line md:left-10" aria-hidden />
            <ul className="space-y-8">
              {stages.map((stage, i) => (
                <li key={stage.id} className="relative flex gap-6 md:gap-8">
                  <div
                    className={`roadmap-node relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[var(--color-surface)] bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] text-lg font-bold text-white ${stage.status === "completed" ? "completed" : stage.status === "in_progress" ? "in-progress" : ""}`}
                  >
                    {stage.status === "completed" ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <RoadmapStepCard
                      stage={stage}
                      stepIndex={i}
                      onStatusChange={(status: StageStatus) =>
                        setStageStatus(stage.id, status)
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </PageShell>
  );
}
