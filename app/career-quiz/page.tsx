"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ProgressHeader } from "@/components/domain/ProgressHeader";
import { QuizQuestionCard } from "@/components/domain/QuizQuestionCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatSalaryRange } from "@/lib/utils";
import { useCareerQuiz } from "@/lib/hooks/useCareerQuiz";

export default function CareerQuizPage() {
  const {
    phase,
    currentStep,
    currentQuestion,
    totalQuestions,
    progress,
    answers,
    results,
    error,
    canProceed,
    isLastQuestion,
    submitAnswer,
    goBack,
    goNext,
    retake,
    addToRoadmap,
    roadmapLoading,
    roadmapAdded,
    roadmapError,
  } = useCareerQuiz();

  // ─── Loading states ──────────────────────────────────────────────────────
  if (phase === "loading-phase2" || phase === "loading-results") {
    return (
      <PageShell
        title="Career Quiz"
        description="Answer a few questions to find careers that fit you."
        maxWidth="lg"
      >
        <div className="flex flex-col items-center justify-center py-20">
          {/* Spinner */}
          <div className="relative mb-6">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {phase === "loading-phase2"
              ? "Generating personalised questions…"
              : "Analysing your answers…"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            {phase === "loading-phase2"
              ? "Our AI is crafting 10 questions based on your interests."
              : "Our AI is finding the best career matches for you."}
          </p>
          <ProgressHeader progress={100} title="" />
        </div>
      </PageShell>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <PageShell
        title="Career Quiz"
        description="Answer a few questions to find careers that fit you."
        maxWidth="lg"
      >
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-7 w-7 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              Something went wrong
            </h3>
            <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              {error}
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={retake}>
                Start over
              </Button>
              <Button variant="primary" onClick={goNext}>
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ─── Results view ────────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <PageShell
        title="Career Quiz"
        description="Answer a few questions to find careers that fit you."
        maxWidth="lg"
      >
        <ProgressHeader
          title="Your career matches"
          description="Based on your answers, these careers are a strong fit. Explore and add them to your roadmap."
        />
        <div className="space-y-6">
          {results.map((career) => (
            <Card key={career.id} padding="lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {career.title}
                    </h3>
                    <Badge variant="success" size="sm">
                      {career.matchScore}% match
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {career.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" size="sm">
                      {formatSalaryRange(career.salaryMin, career.salaryMax)}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {career.education}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    Key skills: {career.skills.join(", ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap gap-2">
                    {roadmapAdded.has(career.id) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Added to roadmap
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => addToRoadmap(career)}
                        disabled={roadmapLoading.has(career.id)}
                      >
                        {roadmapLoading.has(career.id) ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Generating…
                          </span>
                        ) : "Add to roadmap"}
                      </Button>
                    )}
                    <Link
                      href="/learning-resources"
                      className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary-600)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
                    >
                      Explore learning
                    </Link>
                  </div>
                  {roadmapError[career.id] && (
                    <p className="text-xs text-red-500">{roadmapError[career.id]}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={retake}>
            Retake quiz
          </Button>
          <Link
            href="/ai-roadmap"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
          >
            View your roadmap
          </Link>
        </div>
      </PageShell>
    );
  }

  // ─── Question view (Phase 1 & Phase 2) ────────────────────────────────
  const phaseLabel =
    phase === "phase1" ? "Basic Profile" : "Personalised Questions";

  return (
    <PageShell
      title="Career Quiz"
      description="Answer a few questions to find careers that fit you."
      maxWidth="lg"
    >
      <ProgressHeader
        title={currentQuestion?.question ?? "Career Quiz"}
        description={
          phase === "phase1"
            ? "Be honest — there are no wrong answers."
            : "These questions are tailored to your interests."
        }
        progress={progress}
        step={{
          current: currentStep + 1,
          total: totalQuestions,
          label: `${phaseLabel} · Question ${currentStep + 1}`,
        }}
      />
      {currentQuestion && (
        <QuizQuestionCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          type={currentQuestion.type}
          value={answers[currentStep]}
          onChange={submitAnswer}
        />
      )}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={goNext}
          disabled={!canProceed}
        >
          {isLastQuestion
            ? phase === "phase1"
              ? "Generate personalised questions"
              : "See results"
            : "Next"}
        </Button>
      </div>
    </PageShell>
  );
}
