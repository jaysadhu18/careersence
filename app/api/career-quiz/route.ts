import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Phase1Answer {
    questionIndex: number;
    question: string;
    answer: string;
}

interface GenerateQuestionsRequest {
    action: "generate-questions";
    phase1Answers: Phase1Answer[];
}

interface AllAnswer {
    questionIndex: number;
    question: string;
    answer: string;
}

interface GenerateResultsRequest {
    action: "generate-results";
    allAnswers: AllAnswer[];
    phase1Answers?: Phase1Answer[];
    sessionId?: string;
}

type RequestBody = GenerateQuestionsRequest | GenerateResultsRequest;

export interface AIQuestion {
    question: string;
    type: "single";
    options: { value: string; label: string }[];
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

// ─── Prompt builders ─────────────────────────────────────────────────────────

function buildQuestionsSystemPrompt(): string {
    return `You are a career guidance AI. Based on a user's basic profile answers, generate exactly 10 follow-up questions to deeply understand their aptitudes, interests, and ideal career path.

You must respond with ONLY a valid JSON array (no markdown, no code fence, no extra text). Each element must have exactly these keys:
- question (string): the question text
- type (string): always "single"
- options (array): exactly 4 objects, each with "value" (string, snake_case short id) and "label" (string, human readable)

Make questions progressively more specific. Cover:
- Technical vs creative preference
- Leadership vs individual contributor
- Risk tolerance
- Industry-specific interests based on their domain choice
- Soft skills and communication style
- Learning preferences
- Work environment preferences
- Long-term career vision
- Problem types they enjoy
- Values and motivations`;
}

function buildQuestionsUserPrompt(answers: Phase1Answer[]): string {
    const formatted = answers
        .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
        .join("\n\n");
    return `Based on these user profile answers, generate 10 personalised follow-up career assessment questions as a JSON array.

User's basic profile:
${formatted}

Respond with ONLY the JSON array, no other text.`;
}

function buildResultsSystemPrompt(): string {
    return `You are a career guidance AI. Based on a user's complete quiz answers (15 questions), recommend the top 3-5 best-fit career paths.

You must respond with ONLY a valid JSON array (no markdown, no code fence, no extra text). Each element must have exactly these keys:
- id (string): short snake_case identifier
- title (string): career title
- summary (string): 2-3 sentence description of the career and why it fits the user
- salaryMin (number): estimated minimum annual salary in USD
- salaryMax (number): estimated maximum annual salary in USD
- education (string): typical education requirement
- skills (array of strings): 3-5 key skills needed
- matchScore (number): 0-100 percentage match based on the user's answers

Order by matchScore descending (best match first). Be realistic with salary ranges for 2025.`;
}

function buildResultsUserPrompt(answers: AllAnswer[]): string {
    const formatted = answers
        .map((a) => `Q${a.questionIndex + 1}: ${a.question}\nA: ${a.answer}`)
        .join("\n\n");
    return `Based on these complete quiz answers, recommend the best career paths as a JSON array.

User's complete quiz answers:
${formatted}

Respond with ONLY the JSON array, no other text.`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractJSON<T>(text: string): T {
    const trimmed = text.trim();
    const withoutFence = trimmed
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    const parsed = JSON.parse(withoutFence);
    if (!Array.isArray(parsed)) throw new Error("Response is not an array");
    return parsed as T;
}

async function callGroq(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

    const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.5,
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in Groq response");
    return content;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?.id as string | undefined;
        console.log("[career-quiz] token:", token ? { id: token.id, email: token.email } : "null");
        console.log("[career-quiz] userId:", userId ?? "NONE");

        const body = (await request.json()) as RequestBody;

        if (body.action === "generate-questions") {
            // Phase 1 → generate 10 follow-up questions
            if (!body.phase1Answers?.length) {
                return NextResponse.json(
                    { error: "phase1Answers are required" },
                    { status: 400 }
                );
            }

            const raw = await callGroq(
                buildQuestionsSystemPrompt(),
                buildQuestionsUserPrompt(body.phase1Answers)
            );
            const questions = extractJSON<AIQuestion[]>(raw);

            // Validate shape
            const validated = questions.map((q, i) => ({
                question: String(q.question ?? `Question ${i + 1}`),
                type: "single" as const,
                options: Array.isArray(q.options)
                    ? q.options.map((o) => ({
                        value: String(o.value ?? ""),
                        label: String(o.label ?? ""),
                    }))
                    : [],
            }));

            // Save phase 1 to DB for logged-in users
            let sessionId: string | null = null;
            try {
                if (userId) {
                    const quiz = await prisma.quizSession.create({
                        data: {
                            userId,
                            phase1Answers: JSON.stringify(body.phase1Answers),
                            phase2Questions: JSON.stringify(validated),
                        },
                    });
                    sessionId = quiz.id;
                }
            } catch (dbErr) {
                console.error("Failed to save phase1 quiz session:", dbErr);
            }

            return NextResponse.json({ questions: validated, sessionId });
        }

        if (body.action === "generate-results") {
            // All 15 answers → generate career results
            if (!body.allAnswers?.length) {
                return NextResponse.json(
                    { error: "allAnswers are required" },
                    { status: 400 }
                );
            }

            const raw = await callGroq(
                buildResultsSystemPrompt(),
                buildResultsUserPrompt(body.allAnswers)
            );
            const results = extractJSON<CareerResult[]>(raw);

            // Validate shape
            const validated = results.map((r) => ({
                id: String(r.id ?? ""),
                title: String(r.title ?? ""),
                summary: String(r.summary ?? ""),
                salaryMin: Number(r.salaryMin ?? 0),
                salaryMax: Number(r.salaryMax ?? 0),
                education: String(r.education ?? ""),
                skills: Array.isArray(r.skills) ? r.skills.map(String) : [],
                matchScore: Number(r.matchScore ?? 0),
            }));

            // Save/update the quiz session in DB
            try {
                if (userId) {
                    if (body.sessionId) {
                        // Update existing session
                        await prisma.quizSession.update({
                            where: { id: body.sessionId },
                            data: {
                                phase2Answers: JSON.stringify(
                                    body.allAnswers.filter((a) => a.questionIndex >= 5)
                                ),
                                results: JSON.stringify(validated),
                            },
                        });
                    } else {
                        // Create a new complete session (fallback if Phase 1 save failed)
                        await prisma.quizSession.create({
                            data: {
                                userId,
                                phase1Answers: JSON.stringify(
                                    body.phase1Answers ?? body.allAnswers.filter((a) => a.questionIndex < 5)
                                ),
                                phase2Answers: JSON.stringify(
                                    body.allAnswers.filter((a) => a.questionIndex >= 5)
                                ),
                                results: JSON.stringify(validated),
                            },
                        });
                    }
                }
            } catch (dbErr) {
                console.error("Failed to save quiz session:", dbErr);
            }

            return NextResponse.json({ results: validated });
        }

        return NextResponse.json(
            { error: 'Invalid action. Use "generate-questions" or "generate-results".' },
            { status: 400 }
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to process quiz request", details: message },
            { status: 500 }
        );
    }
}
