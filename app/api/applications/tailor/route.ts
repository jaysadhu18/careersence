import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateGeminiContent } from "@/lib/gemini";

// GET — Retrieve existing tailored application and saved job details
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const savedJobId = searchParams.get("savedJobId");

    if (!savedJobId) {
      return NextResponse.json({ error: "Missing savedJobId" }, { status: 400 });
    }

    const savedJob = await prisma.savedJob.findFirst({
      where: { id: savedJobId, userId: session.user.id },
    });

    if (!savedJob) {
      return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { savedJobId },
    });

    if (!application || application.userId !== session.user.id) {
      return NextResponse.json({ savedJob, application: null });
    }

    return NextResponse.json({ savedJob, application });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch application data", details: error.message },
      { status: 500 }
    );
  }
}

// POST — Run Gemini to tailor resume & cover letter and save to DB
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { savedJobId, resumeText, customJobDescription } = body;

    if (!savedJobId || !resumeText) {
      return NextResponse.json(
        { error: "Missing required fields: savedJobId and resumeText are required." },
        { status: 400 }
      );
    }

    // 1. Fetch the saved job details from database
    const savedJob = await prisma.savedJob.findFirst({
      where: { id: savedJobId, userId: session.user.id },
    });

    if (!savedJob) {
      return NextResponse.json({ error: "Saved job not found" }, { status: 404 });
    }

    let jobDescription = customJobDescription || "";

    // 2. If no job description is provided, try to fetch from JSearch API using savedJob.jobId
    if (!jobDescription && process.env.RAPIDAPI_KEY) {
      try {
        const detailsUrl = `https://jsearch.p.rapidapi.com/job-details?job_id=${savedJob.jobId}`;
        const res = await fetch(detailsUrl, {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        });
        if (res.ok) {
          const detailData = await res.json();
          jobDescription = detailData.data?.[0]?.job_description || "";
        }
      } catch (err) {
        console.error("Failed to auto-fetch job description from JSearch:", err);
      }
    }

    // If we still don't have a description, we fall back to a default empty string or error
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is missing. Please provide a job description." },
        { status: 400 }
      );
    }

    // 3. Construct Gemini prompts
    const systemPrompt = `You are an expert resume writer, recruiter, and ATS optimization specialist. Your task is to review a candidate's master resume and a specific job description, and tailor the resume, cover letter, and typical screening questions to maximize the candidate's chance of landing an interview.
You must output a single, strictly valid JSON object with the following structure:
{
  "fitScore": 85, // integer (0 to 100) representing how well the candidate matches the job description
  "fitAnalysis": "string explaining the alignment, missing skills, and highlighting any warnings/deal-breakers",
  "tailoredResume": {
    "name": "Candidate's Full Name (e.g., Dev Patel)",
    "contact": {
      "location": "Candidate's Location (e.g., Gujarat, India)",
      "phone": "Candidate's Phone (e.g., +91-9313143862)",
      "email": "Candidate's Email (e.g., devpatel93131@gmail.com)",
      "github": "Candidate's GitHub URL (e.g., https://github.com/DevPatel2020)",
      "linkedin": "Candidate's LinkedIn profile link",
      "portfolio": "Candidate's Portfolio or website link"
    },
    "skills": {
      "categories": [
        {
          "name": "Category name (e.g., Generative AI & LLMs, Full-Stack AI Development, Cloud, Databases & Tools)",
          "skills": "Comma-separated list of tailored/aligned technical skills matching this category from their background"
        }
      ]
    },
    "experience": [
      {
        "company": "Company Name",
        "location": "Company Location (e.g., Vadodara, Gujarat)",
        "role": "Job Title",
        "duration": "Duration (e.g., Nov 2025 -- May 2026)",
        "highlights": [
          "rewritten bullet point 1 (1-2 sentences) starting with an action verb, emphasizing measurable impact/results matching the job description, maintaining absolute truth to the original resume details"
        ]
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "technologies": "Comma-separated technologies list (e.g., Electron, React, TypeScript, Gemini 2.5 Flash-Lite API, Ollama)",
        "githubUrl": "Project GitHub URL (e.g., https://github.com/DevPatel2020/Wingman-AI)",
        "highlights": [
          "rewritten bullet point 1 emphasizing tools, architecture, or features",
          "rewritten bullet point 2 emphasizing results, optimization, or impact"
        ]
      }
    ],
    "education": [
      {
        "institution": "University/College Name (e.g., Charotar University of Science and Technology)",
        "location": "Institution Location (e.g., Gujarat, India)",
        "degree": "Degree and CGPA/GPA description (e.g., B.Tech in Computer Science and Engineering | CGPA: 8.6/10)",
        "duration": "Graduation Date (e.g., May 2026)"
      }
    ],
    "publicationsAchievementsCertifications": [
      {
        "text": "The full text description of the publication/achievement/certification (e.g. Publication: \"Enhancing Brain Tumor Detection Using YOLOv12\" -- Published in IEEE...)",
        "link": "The URL link for verification (if any)",
        "linkLabel": "The text for the hyperlink (e.g. View Paper or Professional Certificate)"
      }
    ]
  },
  "tailoredCoverLetter": "markdown formatted cover letter, persuasive and professional, tailored to the job and company",
  "screeningAnswers": [
    {
      "question": "typical screening question 1 related to this job",
      "answer": "suggested concise answer based on candidate background"
    },
    {
      "question": "typical screening question 2 related to this job",
      "answer": "suggested concise answer based on candidate background"
    }
  ]
}
Make sure all details are strictly grounded in the candidate's actual resume. Do not invent details. Return ONLY the JSON object.`;

    const userPrompt = `
Job Details:
Title: ${savedJob.title}
Company: ${savedJob.company}
Location: ${savedJob.location}

Job Description:
${jobDescription}

Candidate Resume Text:
${resumeText}

Generate the tailored resume, cover letter, and screening answers based on the candidate's resume and the job details. Be realistic, highlight real achievements, do not exaggerate, and align keywords directly. Return ONLY a valid JSON object matching the requested schema.`;

    // 4. Call Gemini
    const geminiResponseText = await generateGeminiContent(userPrompt, systemPrompt, true);

    let parsedResult;
    try {
      // Remove any potential code blocks/markdown formatting
      const trimmed = geminiResponseText.trim();
      const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsedResult = JSON.parse(withoutFence);
    } catch (parseError) {
      console.error("Gemini output parsing failure. Content:", geminiResponseText);
      return NextResponse.json(
        { error: "Failed to parse AI tailoring output into valid JSON.", details: geminiResponseText },
        { status: 502 }
      );
    }

    // 5. Save/Upsert application into database
    const application = await prisma.jobApplication.upsert({
      where: { savedJobId },
      create: {
        userId: session.user.id,
        savedJobId,
        tailoredCoverLetter: parsedResult.tailoredCoverLetter || "",
        tailoredResume: JSON.stringify(parsedResult.tailoredResume || {}),
        fitScore: parsedResult.fitScore || 0,
        fitAnalysis: parsedResult.fitAnalysis || "",
        screeningAnswers: JSON.stringify(parsedResult.screeningAnswers || []),
      },
      update: {
        tailoredCoverLetter: parsedResult.tailoredCoverLetter || "",
        tailoredResume: JSON.stringify(parsedResult.tailoredResume || {}),
        fitScore: parsedResult.fitScore || 0,
        fitAnalysis: parsedResult.fitAnalysis || "",
        screeningAnswers: JSON.stringify(parsedResult.screeningAnswers || []),
      },
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("AI tailoring error:", error);
    return NextResponse.json(
      { error: "Failed to tailor application", details: error.message },
      { status: 500 }
    );
  }
}
