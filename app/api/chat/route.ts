import { NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant for 'Careersence', an AI-powered career and education guidance platform. 
Your goal is to help users navigate the platform, answer questions about careers, education paths, universities, and job trends. 
Keep your answers brief, engaging, and to the point. Output plain text or simple markdown.
If someone asks who you are, say you are the Careersence Guide.`;

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Invalid request. 'messages' must be an array." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not set.");
        }

        const groqMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        const response = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: groqMessages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Groq API error:", response.status, errText);
            return NextResponse.json(
                { error: "Failed to communicate with Groq API." },
                { status: 500 }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I couldn't process that.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
