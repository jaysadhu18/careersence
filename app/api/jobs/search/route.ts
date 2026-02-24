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
        url.searchParams.set("num_pages", "1");
        url.searchParams.set("date_posted", "month");

        const res = await fetch(url.toString(), {
            headers: {
                "X-RapidAPI-Key": apiKey,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
            // Cache for 10 minutes to reduce API calls
            next: { revalidate: 600 },
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
        const jobs = (data.data ?? []).map((j: Record<string, unknown>) => ({
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
        }));

        return NextResponse.json({ jobs });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json(
            { error: "Failed to fetch jobs", details: message },
            { status: 500 }
        );
    }
}
