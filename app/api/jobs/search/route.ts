import { NextResponse } from "next/server";

const JSEARCH_URL = "https://jsearch.p.rapidapi.com/search";

// ── Server-side experience extractor (runs on the FULL description) ──────────
function extractExperienceFromText(fullText: string): string | null {
    if (!fullText) return null;

    const preferredRe = /preferred|optional|nice[- ]to[- ]have|bonus/i;
    const sentences = fullText.split(/[.!?\n]+/);

    const patterns: { re: RegExp; fmt: (m: RegExpMatchArray) => string }[] = [
        // Range: "2-4 years"  /  "2 to 4 years"
        {
            re: /(\d+)\s*(?:–|-)\s*(\d+)\+?\s*years?(?:\s+of)?(?:\s+(?:relevant\s+|professional\s+|work\s+)?experience)?/i,
            fmt: (m) => `${m[1]}-${m[2]} years`,
        },
        // "X to Y years"
        {
            re: /(\d+)\s+to\s+(\d+)\+?\s*years?(?:\s+of)?(?:\s+(?:relevant\s+|professional\s+|work\s+)?experience)?/i,
            fmt: (m) => `${m[1]}-${m[2]} years`,
        },
        // "minimum X years"  /  "at least X years"
        {
            re: /(?:minimum|at\s+least|min\.?)\s+(\d+)\+?\s*years?(?:\s+of)?(?:\s+(?:relevant\s+|professional\s+|work\s+)?experience)?/i,
            fmt: (m) => `${m[1]}+ years`,
        },
        // "X+ years"
        {
            re: /(\d+)\+\s*years?(?:\s+of)?(?:\s+(?:relevant\s+|professional\s+|work\s+)?experience)?/i,
            fmt: (m) => `${m[1]}+ years`,
        },
        // "X years of experience"
        {
            re: /(\d+)\s*years?\s+of(?:\s+(?:relevant\s+|professional\s+|work\s+))?\s*experience/i,
            fmt: (m) => `${m[1]} year${Number(m[1]) > 1 ? "s" : ""}`,
        },
        // "experience of X years"
        {
            re: /experience\s+of\s+(\d+)\+?\s*years?/i,
            fmt: (m) => `${m[1]}+ years`,
        },
        // "X years experience"
        {
            re: /(\d+)\s*years?\s+(?:relevant\s+|professional\s+|work\s+)?experience/i,
            fmt: (m) => `${m[1]} year${Number(m[1]) > 1 ? "s" : ""}`,
        },
    ];

    // Pass 1: non-preferred sentences only
    for (const pat of patterns) {
        for (const sentence of sentences) {
            const m = sentence.match(pat.re);
            if (m && !preferredRe.test(sentence)) return pat.fmt(m);
        }
    }
    // Pass 2 (fallback): accept preferred mentions if nothing else found
    for (const pat of patterns) {
        for (const sentence of sentences) {
            const m = sentence.match(pat.re);
            if (m) return pat.fmt(m);
        }
    }

    if (/fresh(?:er)?|entry[- ]level|no[\s-]experience\s+required/i.test(fullText)) return "Fresher";
    return null;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "software engineer";
    const location = searchParams.get("location") || "India";
    const page = searchParams.get("page") || "1";

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "RAPIDAPI_KEY is not configured. Add it to .env.local." },
            { status: 500 }
        );
    }

    try {
        const url = new URL(JSEARCH_URL);
        url.searchParams.set("query", `${query} in ${location}`);
        url.searchParams.set("page", page);
        url.searchParams.set("num_pages", "3");
        url.searchParams.set("date_posted", "all");

        const res = await fetch(url.toString(), {
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json(
                { error: `JSearch API error: ${res.status}`, details: text },
                { status: res.status }
            );
        }

        const data = await res.json();

        const jobs = (data.data ?? []).map((j: Record<string, unknown>) => {
            const expData = j.job_required_experience as Record<string, unknown> | null ?? {};
            const noExpRequired = expData.no_experience_required as boolean | null ?? null;
            const expMonths = expData.required_experience_in_months as number | null ?? null;
            const requiredExperienceMonths: number | null =
                noExpRequired === true ? 0 : expMonths;

            // Full description — used for extraction, then trimmed for payload
            const fullDescription = (j.job_description as string) ?? "";

            // Highlights qualifications
            const highlights = j.job_highlights as Record<string, unknown> | null ?? {};
            const qualifications = (highlights.Qualifications as string[] | null) ?? [];

            // Priority 1: scan qualifications for an experience bullet
            const expKeywords = ["year", "experience", "yr", "yrs"];
            const fromQualifications = qualifications.find((q) =>
                expKeywords.some((kw) => q.toLowerCase().includes(kw))
            ) ?? null;

            // Priority 2: run full-description extraction before truncating
            const fromDescription = extractExperienceFromText(
                qualifications.join(" ") + " " + fullDescription
            );

            // Priority 3: fall back to months data
            const fromMonths: string | null =
                noExpRequired === true
                    ? "Fresher"
                    : expMonths !== null
                        ? `${Math.round(expMonths / 12)} year${Math.round(expMonths / 12) > 1 ? "s" : ""}`
                        : null;

            const experienceText: string | null =
                fromQualifications ?? fromDescription ?? fromMonths ?? null;

            return {
                id: j.job_id as string,
                title: j.job_title as string,
                company: j.employer_name as string,
                location: [j.job_city, j.job_state, j.job_country]
                    .filter(Boolean)
                    .join(", "),
                type: j.job_employment_type as string,
                // Keep display description short; extraction already done above
                description: fullDescription.slice(0, 400) + (fullDescription.length > 400 ? "…" : ""),
                url: j.job_apply_link as string,
                source: (j.job_publisher as string) ?? "JSearch",
                postedAt: j.job_posted_at_datetime_utc as string,
                requiredExperienceMonths,
                experienceText,
                isRemote: typeof j.job_is_remote === "boolean" ? j.job_is_remote : null,
            };
        });

        return NextResponse.json({ jobs });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to fetch jobs", details: message },
            { status: 500 }
        );
    }
}

