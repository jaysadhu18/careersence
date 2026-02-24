"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ProgressHeader } from "@/components/domain/ProgressHeader";
import { QuizQuestionCard, type QuizOption } from "@/components/domain/QuizQuestionCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { careerQuizResults } from "@/lib/mock-data";
import { formatSalaryRange } from "@/lib/utils";

const questions: { question: string; options: QuizOption[]; type: "single" | "likert" }[] = [
  {
    question: "I enjoy solving problems with logic and structure.",
    type: "likert",
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
    ],
  },
  {
    question: "Which type of work do you prefer?",
    type: "single",
    options: [
      { value: "building", label: "Building products or systems" },
      { value: "analyzing", label: "Analyzing data and trends" },
      { value: "people", label: "Working with people and teams" },
      { value: "creating", label: "Creating content or design" },
    ],
  },
  {
    question: "What matters most in a job?",
    type: "single",
    options: [
      { value: "salary", label: "High salary and growth" },
      { value: "impact", label: "Social impact" },
      { value: "balance", label: "Work-life balance" },
      { value: "learning", label: "Continuous learning" },
    ],
  },
];

export default function CareerQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);

  const totalSteps = questions.length + 1;
  const isResults = completed;
  const currentQuestion = questions[step];
  const progress = isResults ? 100 : ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < questions.length - 1) setStep((s) => s + 1);
    else setCompleted(true);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const canProceed = currentQuestion && answers[step] !== undefined;

  return (
    <PageShell
      title="Career Quiz"
      description="Answer a few questions to find careers that fit you."
      maxWidth="lg"
    >
      {!isResults ? (
        <>
          <ProgressHeader
            title={currentQuestion?.question ?? "Career Quiz"}
            description="Be honest — there are no wrong answers."
            progress={progress}
            step={{
              current: step + 1,
              total: questions.length,
              label: `Question ${step + 1}`,
            }}
          />
          {currentQuestion && (
            <QuizQuestionCard
              question={currentQuestion.question}
              options={currentQuestion.options}
              type={currentQuestion.type}
              value={answers[step]}
              onChange={(v) => setAnswers((a) => ({ ...a, [step]: v }))}
            />
          )}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed}
            >
              {step === questions.length - 1 ? "See results" : "Next"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ProgressHeader
            title="Your career matches"
            description="Based on your answers, these clusters are a strong fit. Explore and add them to your roadmap."
          />
          <div className="space-y-6">
            {careerQuizResults.map((career) => (
              <Card key={career.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {career.title}
                    </h3>
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
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm">
                      Add to roadmap
                    </Button>
                    <Link
                      href="/learning-resources"
                      className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--color-primary-600)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
                    >
                      Explore learning
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" onClick={() => { setCompleted(false); setStep(0); setAnswers({}); }}>
              Retake quiz
            </Button>
            <Link
              href="/ai-roadmap"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
            >
              View your roadmap
            </Link>
          </div>
        </>
      )}
    </PageShell>
  );
}
