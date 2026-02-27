import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface CollegeFromAPI {
  name: string;
  location: string;
  degree: string;
  costRange: string;
  admissionRate: string;
  strengths: string[];
  stateRanking: string;
  countryRanking: string;
  worldRanking: string;
}

function buildSystemPrompt(): string {
  return `You are an expert education counselor specializing in Indian colleges and universities. Given a state, field of study, and degree type, you must respond with ONLY a valid JSON array (no markdown, no code fence, no extra text). Each element is an object with exactly these keys:
- name (string): full official name of the college/university
- location (string): city, state
- degree (string): the specific degree program offered (e.g. "B.Tech in Computer Science and Engineering")
- costRange (string): approximate annual fee range in INR (e.g. "₹50,000 – ₹2,00,000/year")
- admissionRate (string): approximate acceptance/admission rate as a percentage (e.g. "15%"), or "Varies" if unknown
- strengths (array of 2-4 strings): key strengths like NAAC rating, NIRF ranking, placements, campus, special programs
- stateRanking (string): ranking within the state (e.g. "#3 in Gujarat", "#12 in Maharashtra"), or "Not ranked" if unknown
- countryRanking (string): NIRF or national ranking in India (e.g. "#45 in India", "NIRF #120"), or "Not ranked" if unknown
- worldRanking (string): QS/THE world ranking if applicable (e.g. "QS #350", "THE #501-600"), or "Not ranked" if the college is not in world rankings

Return as many REAL colleges as you can (aim for 15-20) that actually exist in the specified Indian state and offer the requested program. Be accurate — use real college names and realistic fee ranges. Order by reputation/ranking. If very few colleges match exactly, include nearby or closely related programs. If the user provides a list of colleges to exclude, do NOT include those in your response.`;
}

function buildUserPrompt(state: string, field: string, degreeType: string, exclude?: string[]): string {
  let prompt = `Find colleges in ${state}, India that offer a ${degreeType} degree in ${field}.`;

  if (exclude && exclude.length > 0) {
    prompt += `\n\nDo NOT include these colleges (already shown):\n${exclude.map((n) => `- ${n}`).join("\n")}`;
    prompt += `\n\nReturn 10-15 DIFFERENT colleges not in the above list.`;
  }

  prompt += `\n\nReturn ONLY the JSON array, no other text.`;
  return prompt;
}

function extractJSON(text: string): CollegeFromAPI[] {
  const trimmed = text.trim();
  // Try direct parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* continue */ }

  // Try extracting JSON from markdown code block
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch { /* continue */ }
  }

  // Try finding array in text
  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* continue */ }
  }

  return [];
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { state, field, degreeType, exclude } = body as {
    state?: string;
    field?: string;
    degreeType?: string;
    exclude?: string[];
  };

  if (!state || !field || !degreeType) {
    return NextResponse.json(
      { error: "Please select a state, field of study, and degree type" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(state, field, degreeType, exclude) },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: "Failed to fetch colleges from AI service" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const colleges = extractJSON(raw);

    if (colleges.length === 0) {
      return NextResponse.json(
        { error: "No colleges found. Try different filters." },
        { status: 404 }
      );
    }

    // Add IDs to each college (offset by exclude count to avoid ID clashes)
    const offset = exclude?.length ?? 0;
    const withIds = colleges.map((c, i) => ({
      id: `college-${offset + i + 1}`,
      ...c,
    }));

    return NextResponse.json({ colleges: withIds });
  } catch (err) {
    console.error("College search error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
