import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
    try {
        const { careers } = await req.json();

        if (!careers || !Array.isArray(careers) || careers.length !== 2) {
            return NextResponse.json(
                { error: "Please provide exactly 2 careers to compare" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GROQ_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const prompt = `You are an expert career guidance AI with deep knowledge of the Indian job market.

A user wants to compare these careers:
${JSON.stringify(careers)}

Provide a detailed, accurate comparison based on current 2026 market data for India.

IMPORTANT INSTRUCTIONS:
- Be specific and realistic with salary ranges in INR (use actual market data)
- Difficulty to Enter should reflect actual barriers (education, competition, experience needed)
- Automation Risk should be based on AI/technology impact on the role
- Remote Work should reflect actual industry practices in India
- Job Demand Score should reflect current hiring trends in India
- Work-Life Balance should be realistic (1-5 stars, where 5 is best)

Return ONLY valid JSON with this exact structure:

{
  "career_comparison": [
    {
      "career_name": "exact career name",
      "description": "clear 1-2 sentence description of the role",
      "average_salary_india": "₹X - ₹Y LPA (realistic range for mid-level)",
      "required_education": ["specific degree or qualification"],
      "key_skills": ["list 4-6 most important technical/soft skills"],
      "job_demand_score": 85,
      "work_life_balance": 4,
      "difficulty_to_enter": "Low/Medium/High",
      "automation_risk": "Low/Medium/High",
      "remote_work_possibility": "Yes/No",
      "career_growth_path": ["Entry level role", "Mid level role", "Senior level role", "Leadership role"],
      "top_industries": ["list 3-5 industries hiring for this role"]
    }
  ]
}

Rules:
- Return ONLY the JSON object, no other text
- Use realistic Indian market data
- Be consistent with difficulty and risk assessments
- Salary should be in LPA (Lakhs Per Annum) format`;

        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert career guidance AI. You always reply with valid JSON only."
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No content in Groq response");

        let cleanedJson = content.trim();
        const jsonMatch = cleanedJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
            cleanedJson = jsonMatch[1].trim();
        } else {
            const firstBrace = cleanedJson.indexOf('{');
            const lastBrace = cleanedJson.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
            }
        }

        const comparison = JSON.parse(cleanedJson);

        return NextResponse.json({ comparison });

    } catch (error: any) {
        console.error("Career comparison error:", error);
        return NextResponse.json(
            { error: "Failed to compare careers: " + error.message },
            { status: 500 }
        );
    }
}
