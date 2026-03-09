import { NextResponse } from "next/server";

const JSEARCH_URL = "https://jsearch.p.rapidapi.com/search";

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

        // Normalize the response to a consistent shape
        const jobs = (data.data ?? []).map((j: Record<string, unknown>) => {
            const expData = j.job_required_experience as Record<string, unknown> | null ?? {};
            const noExpRequired = expData.no_experience_required as boolean | null ?? null;
            const expMonths = expData.required_experience_in_months as number | null ?? null;
            const requiredExperienceMonths: number | null =
                noExpRequired === true ? 0 : expMonths;

            // Try to extract a human-readable experience string from job_highlights.Qualifications
            // e.g. "4+ years of experience in data analysis"
            const highlights = j.job_highlights as Record<string, unknown> | null ?? {};
            const qualifications = (highlights.Qualifications as string[] | null) ?? [];
            const expKeywords = ["year", "experience", "yr", "yrs"];
            const experienceText: string | null =
                qualifications.find((q) =>
                    expKeywords.some((kw) => q.toLowerCase().includes(kw))
                ) ??
                // Fallback: build from months data
                (noExpRequired === true
                    ? "Fresher / No experience required"
                    : expMonths !== null
                        ? `${Math.round(expMonths / 12)} year${Math.round(expMonths / 12) > 1 ? "s" : ""}`
                        : null);

            return {
                id: j.job_id as string,
                title: j.job_title as string,
                company: j.employer_name as string,
                location: [j.job_city, j.job_state, j.job_country]
                    .filter(Boolean)
                    .join(", "),
                type: j.job_employment_type as string,
                description: (j.job_description as string)?.slice(0, 300) + "…",
                url: j.job_apply_link as string,
                source: (j.job_publisher as string) ?? "JSearch",
                postedAt: j.job_posted_at_datetime_utc as string,
                requiredExperienceMonths,
                experienceText,  // human-readable e.g. "4+ years of experience in ML"
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
