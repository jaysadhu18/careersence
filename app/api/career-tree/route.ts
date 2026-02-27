import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface CareerTreeInput {
    skills: string;
    passions: string;
    targetRoles: string;
    currentStage: string;
    shortTermGoal: string;
    longTermGoal: string;
}

export interface CareerMilestone {
    title: string;
    timeframe: string;
    skills: string[];
    actions: string[];
}

export interface CareerBranch {
    id: string;
    title: string;
    color: string;
    description: string;
    shortTermAlignment: string;
    longTermAlignment: string;
    milestones: CareerMilestone[];
}

export interface CareerTreeData {
    root: { title: string; description: string; skills: string[] };
    branches: CareerBranch[];
}

const BRANCH_COLORS = ["#2563eb", "#0d9488", "#7c3aed"];

function buildSystemPrompt(): string {
    return `You are an expert career counselor specializing in student career development. Given a student's self-assessment data, you must respond with ONLY a valid JSON object (no markdown, no code fence, no extra text).

The JSON must have this exact structure:
{
  "root": {
    "title": "short label for the starting point (max 5 words)",
    "description": "2-sentence summary of the student's current position and strengths",
    "skills": ["skill1", "skill2", "skill3", "skill4"]
  },
  "branches": [
    {
      "id": "branch-1",
      "title": "Career Path Name (max 4 words)",
      "description": "2-3 sentences describing this career direction and why it suits the student",
      "shortTermAlignment": "1 sentence: how this path achieves their short-term goal",
      "longTermAlignment": "1 sentence: how this path achieves their long-term goal",
      "milestones": [
        {
          "title": "Milestone name (max 5 words)",
          "timeframe": "e.g. 0–3 months, 3–6 months, 6–12 months, 1–2 years",
          "skills": ["skill to gain 1", "skill to gain 2"],
          "actions": ["specific action 1", "specific action 2", "specific action 3"]
        }
      ]
    }
  ]
}

Rules:
- Create exactly 3 branches representing distinct career paths suited to the student's profile
- Each branch must have exactly 4 milestones ordered chronologically
- Be specific, practical, and encouraging
- All text must be concise — no waffle
- Respond with ONLY the JSON object`;
}

function buildUserPrompt(input: CareerTreeInput): string {
    return `Generate a career tree for this student:

- Current skills: ${input.skills}
- Passions & interests: ${input.passions}
- Target roles they've researched: ${input.targetRoles}
- Current stage: ${input.currentStage}
- Short-term goal (next 6–12 months): ${input.shortTermGoal}
- Long-term goal (3–5 years): ${input.longTermGoal}

Respond with ONLY the JSON object, no other text.`;
}

function extractJSON(text: string): CareerTreeData {
    const trimmed = text.trim();
    const withoutFence = trimmed
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    const parsed = JSON.parse(withoutFence) as CareerTreeData;
    if (!parsed.root || !Array.isArray(parsed.branches)) {
        throw new Error("Invalid career tree structure");
    }
    // Assign colors to branches
    parsed.branches = parsed.branches.map((branch, i) => ({
        ...branch,
        color: BRANCH_COLORS[i % BRANCH_COLORS.length],
    }));
    return parsed;
}

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GROQ_API_KEY is not configured. Add it to .env.local." },
                { status: 500 }
            );
        }

        const body = (await request.json()) as CareerTreeInput;
        const { skills, passions, shortTermGoal, longTermGoal } = body;

        if (!skills?.trim() || !passions?.trim()) {
            return NextResponse.json(
                { error: "skills and passions are required" },
                { status: 400 }
            );
        }
        if (!shortTermGoal?.trim() || !longTermGoal?.trim()) {
            return NextResponse.json(
                { error: "shortTermGoal and longTermGoal are required" },
                { status: 400 }
            );
        }

        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: buildSystemPrompt() },
                    {
                        role: "user",
                        content: buildUserPrompt({
                            skills: skills.trim(),
                            passions: passions.trim(),
                            targetRoles: body.targetRoles?.trim() ?? "",
                            currentStage: body.currentStage?.trim() ?? "",
                            shortTermGoal: shortTermGoal.trim(),
                            longTermGoal: longTermGoal.trim(),
                        }),
                    },
                ],
                temperature: 0.5,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json(
                { error: `Groq API error: ${response.status}`, details: errText },
                { status: response.status }
            );
        }

        const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            return NextResponse.json(
                { error: "No content in Groq response" },
                { status: 502 }
            );
        }

        const tree = extractJSON(content);

        // Save to DB if user is authenticated (best-effort, non-blocking on failure)
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.id) {
                await prisma.careerTree.create({
                    data: {
                        userId: session.user.id,
                        rootTitle: tree.root.title,
                        formInput: JSON.stringify(body),
                        treeData: JSON.stringify(tree),
                    },
                });
            }
        } catch {
            // Don't fail the request if DB save fails
        }

        return NextResponse.json({ tree });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to generate career tree", details: message },
            { status: 500 }
        );
    }
}
