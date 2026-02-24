import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export interface RoadmapAnswer {
  careerGoal: string;
  currentStage: string;
  timeline: string;
  experience: string;
  interests: string;
}

export interface RoadmapStageFromAPI {
  title: string;
  description: string;
  timeRange: string;
  actions: string[];
  resources?: string[];
}

function buildSystemPrompt(): string {
  return `You are a career coach. Given a user's career goal and context, you must respond with ONLY a valid JSON array (no markdown, no code fence, no extra text). Each element of the array is an object with exactly these keys:
- title (string): short stage name
- description (string): 2-3 sentences explaining this stage
- timeRange (string): e.g. "1-2 weeks", "2-3 months"
- actions (array of strings): 4-7 concrete action items the user should do in this stage
- resources (array of strings, optional): 0-3 suggested resource types or topics (e.g. "Online course on X", "Practice project Y")

Create 5-7 stages that form a detailed, step-by-step roadmap from the user's current situation to their goal. Be specific and actionable. Order stages chronologically.`;
}

function buildUserPrompt(answers: RoadmapAnswer): string {
  return `Generate a detailed career roadmap as a JSON array of stages.

User inputs:
- Career goal: ${answers.careerGoal}
- Current stage: ${answers.currentStage}
- Timeline they have in mind: ${answers.timeline}
- Current experience/skills: ${answers.experience}
- Interests/constraints: ${answers.interests}

Respond with ONLY the JSON array, no other text.`;
}

function extractJSON(text: string): RoadmapStageFromAPI[] {
  const trimmed = text.trim();
  // Remove optional markdown code block
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(withoutFence) as RoadmapStageFromAPI[];
  if (!Array.isArray(parsed)) throw new Error("Response is not an array");
  return parsed.map((s) => ({
    title: String(s.title ?? ""),
    description: String(s.description ?? ""),
    timeRange: String(s.timeRange ?? ""),
    actions: Array.isArray(s.actions) ? s.actions.map(String) : [],
    resources: Array.isArray(s.resources) ? s.resources.map(String) : [],
  }));
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

    const body = (await request.json()) as RoadmapAnswer;
    const { careerGoal, currentStage, timeline, experience, interests } = body;
    if (!careerGoal?.trim()) {
      return NextResponse.json(
        { error: "careerGoal is required" },
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
              careerGoal: careerGoal.trim(),
              currentStage: currentStage?.trim() ?? "",
              timeline: timeline?.trim() ?? "",
              experience: experience?.trim() ?? "",
              interests: interests?.trim() ?? "",
            }),
          },
        ],
        temperature: 0.4,
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

    const stages = extractJSON(content);

    // Save the roadmap to the database if the user is logged in
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await prisma.roadmap.create({
          data: {
            userId: session.user.id,
            careerGoal: careerGoal.trim(),
            stages: JSON.stringify(stages),
          },
        });
      }
    } catch {
      // Don't block the response if DB save fails
    }

    return NextResponse.json({ stages });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate roadmap", details: message },
      { status: 500 }
    );
  }
}
