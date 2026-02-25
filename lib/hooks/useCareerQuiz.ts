"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuizPhase =
    | "phase1"
    | "loading-phase2"
    | "phase2"
    | "loading-results"
    | "results";

export interface QuizOption {
    value: string;
    label: string;
}

export interface QuizQuestion {
    question: string;
    type: "single" | "likert";
    options: QuizOption[];
}

export interface CareerResult {
    id: string;
    title: string;
    summary: string;
    salaryMin: number;
    salaryMax: number;
    education: string;
    skills: string[];
    matchScore: number;
}

// ─── Phase 1 questions (hardcoded — same for all users) ──────────────────────

const PHASE1_QUESTIONS: QuizQuestion[] = [
    {
        question: "What is your current education level?",
        type: "single",
        options: [
            { value: "high_school", label: "High School" },
            { value: "bachelors", label: "Bachelor's Degree" },
            { value: "masters", label: "Master's Degree" },
            { value: "phd", label: "PhD" },
            { value: "other", label: "Other / Self-taught" },
        ],
    },
    {
        question: "Which work style appeals to you most?",
        type: "single",
        options: [
            { value: "remote", label: "Remote — work from anywhere" },
            { value: "office", label: "Office — structured environment" },
            { value: "hybrid", label: "Hybrid — mix of both" },
            { value: "fieldwork", label: "Fieldwork — hands-on in the real world" },
        ],
    },
    {
        question: "Which domain interests you the most?",
        type: "single",
        options: [
            { value: "technology", label: "Technology & Engineering" },
            { value: "business", label: "Business & Finance" },
            { value: "healthcare", label: "Healthcare & Life Sciences" },
            { value: "creative", label: "Creative Arts & Design" },
            { value: "science", label: "Science & Research" },
            { value: "education", label: "Education & Social Impact" },
        ],
    },
    {
        question: "How do you prefer to solve problems?",
        type: "single",
        options: [
            { value: "analytical", label: "Analytically with data and logic" },
            { value: "creative", label: "Creatively with new ideas" },
            { value: "collaborative", label: "Collaboratively with people" },
            { value: "hands_on", label: "Hands-on by building things" },
        ],
    },
    {
        question: "What matters most to you in a career?",
        type: "single",
        options: [
            { value: "salary", label: "High salary and financial growth" },
            { value: "balance", label: "Work-life balance" },
            { value: "impact", label: "Social impact and meaning" },
            { value: "learning", label: "Continuous learning and challenges" },
            { value: "security", label: "Job security and stability" },
        ],
    },
];

const TOTAL_PHASE1 = PHASE1_QUESTIONS.length; // 5
const TOTAL_PHASE2 = 10;
const TOTAL_QUESTIONS = TOTAL_PHASE1 + TOTAL_PHASE2; // 15

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCareerQuiz() {
    const [phase, setPhase] = useState<QuizPhase>("phase1");
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [phase2Questions, setPhase2Questions] = useState<QuizQuestion[]>([]);
    const [results, setResults] = useState<CareerResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Current question based on phase
    const allQuestions = [...PHASE1_QUESTIONS, ...phase2Questions];
    const currentQuestion: QuizQuestion | undefined = allQuestions[currentStep];
    const totalQuestions = phase === "phase1" ? TOTAL_PHASE1 : TOTAL_QUESTIONS;

    // Progress: 0-100
    const progress =
        phase === "results" || phase === "loading-results"
            ? 100
            : ((currentStep + 1) / totalQuestions) * 100;

    // Set the answer for the current question
    const submitAnswer = useCallback((value: string) => {
        setAnswers((prev) => ({ ...prev, [currentStep]: value }));
    }, [currentStep]);

    // Navigate back
    const goBack = useCallback(() => {
        if (currentStep > 0) {
            // If we're in phase2 and going back to phase1 boundary
            if (phase === "phase2" && currentStep === TOTAL_PHASE1) {
                setPhase("phase1");
            }
            setCurrentStep((s) => s - 1);
        }
    }, [currentStep, phase]);

    // Navigate forward / trigger API calls
    const goNext = useCallback(async () => {
        setError(null);

        // End of Phase 1 → call API for follow-up questions
        if (phase === "phase1" && currentStep === TOTAL_PHASE1 - 1) {
            setPhase("loading-phase2");
            try {
                const phase1Answers = PHASE1_QUESTIONS.map((q, i) => ({
                    questionIndex: i,
                    question: q.question,
                    answer:
                        q.options.find((o) => o.value === answers[i])?.label ??
                        answers[i] ??
                        "",
                }));

                const res = await fetch("/api/career-quiz", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "generate-questions",
                        phase1Answers,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to generate questions");
                }

                const data = await res.json();
                setPhase2Questions(data.questions);
                if (data.sessionId) setSessionId(data.sessionId);
                setPhase("phase2");
                setCurrentStep(TOTAL_PHASE1);
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "Failed to generate questions"
                );
                setPhase("phase1"); // let user retry
            }
            return;
        }

        // End of Phase 2 → call API for results
        if (
            phase === "phase2" &&
            currentStep === TOTAL_PHASE1 + phase2Questions.length - 1
        ) {
            setPhase("loading-results");
            try {
                const allAnswersList = allQuestions.map((q, i) => ({
                    questionIndex: i,
                    question: q.question,
                    answer:
                        q.options.find((o) => o.value === answers[i])?.label ??
                        answers[i] ??
                        "",
                }));

                const phase1AnswersList = PHASE1_QUESTIONS.map((q, i) => ({
                    questionIndex: i,
                    question: q.question,
                    answer:
                        q.options.find((o) => o.value === answers[i])?.label ??
                        answers[i] ??
                        "",
                }));

                const res = await fetch("/api/career-quiz", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "generate-results",
                        allAnswers: allAnswersList,
                        phase1Answers: phase1AnswersList,
                        sessionId,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to generate results");
                }

                const data = await res.json();
                setResults(data.results);
                setPhase("results");
            } catch (e) {
                setError(
                    e instanceof Error ? e.message : "Failed to generate results"
                );
                setPhase("phase2"); // let user retry
            }
            return;
        }

        // Normal next
        setCurrentStep((s) => s + 1);
    }, [phase, currentStep, answers, phase2Questions, allQuestions, sessionId]);

    // Reset everything
    const retake = useCallback(() => {
        setPhase("phase1");
        setCurrentStep(0);
        setAnswers({});
        setPhase2Questions([]);
        setResults([]);
        setError(null);
        setSessionId(null);
    }, []);

    const canProceed = answers[currentStep] !== undefined;

    const isLastQuestion =
        (phase === "phase1" && currentStep === TOTAL_PHASE1 - 1) ||
        (phase === "phase2" &&
            currentStep === TOTAL_PHASE1 + phase2Questions.length - 1);

    return {
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
    };
}
