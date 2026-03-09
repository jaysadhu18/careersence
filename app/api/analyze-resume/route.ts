import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
// pdf-parse is imported dynamically in the POST handler
// @ts-ignore
import mammoth from "mammoth";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GROQ_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let text = "";

        // 1. Extract Text
        if (file.type === "application/pdf") {
            try {
                // @ts-ignore
                const { PDFParse } = await import("pdf-parse");
                const workerPath = "file://" + path.resolve("node_modules/pdfjs-dist/build/pdf.worker.mjs");
                // @ts-ignore
                PDFParse.setWorker(workerPath);
                // @ts-ignore
                const parser = new PDFParse({ data: buffer });
                // @ts-ignore
                const data = await parser.getText();
                text = data.text;
                await parser.destroy();
            } catch (pdfError: any) {
                console.error("Internal PDF parsing error:", pdfError);
                throw new Error("PDF parsing failed: " + pdfError.message);
            }
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload a .txt, .pdf, or .docx file." },
                { status: 400 }
            );
        }

        // 2. Validate if the uploaded text looks like a resume
        if (text.trim().length < 50) {
            return NextResponse.json(
                { error: "The file contains too little text or is an image-based PDF without readable text. Please upload a valid, text-searchable resume." },
                { status: 400 }
            );
        }

        const lowerText = text.toLowerCase();
        const resumeKeywords = ["experience", "education", "skills", "work", "employment", "university", "college", "degree", "project", "certification", "profile", "summary", "objective"];
        const matchCount = resumeKeywords.filter(kw => lowerText.includes(kw)).length;

        // If it doesn't have at least 2 common resume keywords, it's likely not a resume
        if (matchCount < 2) {
            return NextResponse.json(
                { error: "This document does not appear to be a resume. It is missing standard sections like Experience, Education, or Skills. Please upload a valid resume." },
                { status: 400 }
            );
        }

        // 3. Analyze with Groq
        const prompt = `You are an expert AI Resume Reviewer, Career Coach, and ATS Optimization Specialist.

Your task is to analyze a candidate’s resume and provide a detailed professional evaluation.

You MUST structure your response EXACTLY as follows:

First, a STRICTLY valid JSON object with the following schema:
{
  "overallScore": 85, // Integer (0-100) representing the overall ATS compatibility and resume strength
  "subScores": {
    "impact": 80, // Score (0-100) for measurable achievements and technical depth
    "skills": 90, // Score (0-100) for keyword density and skill relevance
    "formatting": 75 // Score (0-100) for structure, readability, and ATS parsing ability
  }
}

Second, exactly this separator sequence on a new line:
===MARKDOWN_REPORT===

Third, the comprehensive report covering these 26 areas below, formatted in Markdown:
1. Candidate Name & Personal Info (Extract the candidate's full name, email, phone number, LinkedIn, portfolio, and location if present.)
2. Overall Resume Quality (Evaluate the overall strength of the resume. Provide an overall score out of 100 and explain your reasoning.)
3. ATS Compatibility (Analyze whether the resume is optimized for Applicant Tracking Systems. Mention ATS score, formatting issues, and keyword optimization.)
4. Skills Intelligence (Identify the candidate’s strongest skills, intermediate skills, and skill categories.)
5. Missing Skills (Identify important industry skills missing from the resume that could improve job opportunities.)
6. Experience Impact (Evaluate the experience section. Discuss technical depth, measurable achievements, and impact.)
7. Project Quality (Evaluate the projects listed in the resume. Comment on complexity, technologies used, and real-world impact.)
8. Education Evaluation (Analyze the relevance and strength of the candidate's education.)
9. Certification Evaluation (Evaluate certifications and their relevance to the candidate’s career path.)
10. Leadership Evidence (Identify examples of leadership, teamwork, mentorship, or ownership.)
11. Writing Quality (Evaluate grammar, clarity, tone, and professionalism.)
12. Action Verb Quality (Analyze the use of action verbs and suggest stronger verbs where needed.)
13. Resume Structure (Evaluate section order, organization, and logical flow.)
14. Resume Formatting (Analyze formatting, readability, bullet points, and spacing.)
15. Keyword Density (Evaluate the use of industry keywords and identify missing important keywords.)
16. Career Progression (Analyze the career growth pattern and professional development.)
17. Role Fit Prediction (Suggest the most suitable job roles for the candidate based on their resume.)
18. Industry Competitiveness (Evaluate how competitive this candidate would be in the job market.)
19. Resume Strengths (List the strongest aspects of the resume.)
20. Resume Weaknesses (Identify weaknesses or areas that could reduce hiring chances.)
21. Bullet Point Improvements (Rewrite a few weak bullet points from the resume into stronger, more impactful versions.)
22. Resume Improvement Suggestions (Provide actionable suggestions to significantly improve the resume.)
23. Interview Readiness (Estimate the candidate’s interview readiness level (Low / Medium / High) and explain what they should improve.)
24. Salary Estimation (Provide a rough estimated salary range based on skills and experience.)
25. Personal Branding Strength (Evaluate the candidate’s professional presence such as GitHub, LinkedIn, or portfolio.)
26. Final Recommendation (Provide a final professional assessment of the resume and whether it is competitive for the job market.)

Important instructions:
* Use clear headings for each section.
* Provide practical, realistic feedback.
* Use bullet points where appropriate.
* Write like a professional recruiter reviewing a resume.
* CRITICAL: Base your entire analysis ONLY on the provided Resume Text. Do NOT invent, hallucinate, or assume any skills, experiences, projects, or education that are not explicitly written in the resume. If sections are missing, explicitly state that they are missing instead of guessing.

Resume Text:
${text}
`;

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
                        content: "You are an expert AI Resume Reviewer. You always reply strictly with a valid JSON object followed by '===MARKDOWN_REPORT===' and then the Markdown report."
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2, // Low temp for reliable JSON
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Groq API error ${response.status}: ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No content in Groq response");

        // Split JSON from Markdown
        const parts = content.split("===MARKDOWN_REPORT===");
        let cleanedJson = parts[0].trim();
        const markdownReport = parts.length > 1 ? parts.slice(1).join("===MARKDOWN_REPORT===").trim() : "";

        const jsonMatch = cleanedJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (jsonMatch) {
            cleanedJson = jsonMatch[1].trim();
        } else {
            // Find the first { and last }
            const firstBrace = cleanedJson.indexOf('{');
            const lastBrace = cleanedJson.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                cleanedJson = cleanedJson.substring(firstBrace, lastBrace + 1);
            }
        }

        let analysis: any;
        try {
            analysis = JSON.parse(cleanedJson);
            analysis.markdownReport = markdownReport;
        } catch (e) {
            console.error("Failed JSON String:", cleanedJson);
            throw new Error("Failed to parse Groq response into JSON");
        }

        // Save to Database if user is authenticated
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            try {
                // @ts-ignore - Prisma types might not have caught up in the IDE yet
                await prisma.resumeAnalysis.create({
                    data: {
                        userId: session.user.id,
                        fileName: file.name,
                        overallScore: analysis.overallScore || 0,
                        subScores: JSON.stringify(analysis.subScores || {}),
                        markdownReport: analysis.markdownReport || "",
                    }
                });
            } catch (dbError) {
                console.error("Failed to save resume analysis to database:", dbError);
                // We do not fail the request just because DB save failed
            }
        }

        return NextResponse.json({ analysis });

    } catch (error: any) {
        console.error("Resume analysis error:", error);
        return NextResponse.json(
            { error: "Failed to analyze resume: " + error.message },
            { status: 500 }
        );
    }
}
