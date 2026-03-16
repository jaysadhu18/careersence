import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ courses: [] });
    }

    try {
        // TODO: Replace with actual RapidAPI integration
        // Example format for RapidAPI call:
        /*
        const response = await fetch(`https://some-rapidapi-host.p.rapidapi.com/search?q=${encodeURIComponent(q)}`, {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
            "x-rapidapi-host": "some-rapidapi-host.p.rapidapi.com"
          }
        });
        const data = await response.json();
        */

        console.log("Searching courses for query:", q);

        // Returning mock data for now while building UI
        const mockCourses = [
            {
                id: `api-mock-${Date.now()}-1`,
                title: `RapidAPI Result: ${q} Masterclass`,
                description: `This is a dynamically fetched course from RapidAPI relating to ${q}.`,
                type: "course",
                level: "Beginner",
                durationMinutes: 180,
                source: "RapidAPI Provider",
                url: "#",
            },
            {
                id: `api-mock-${Date.now()}-2`,
                title: `Advanced ${q} Techniques`,
                description: `Deep dive into advanced topics for ${q} fetched directly via API.`,
                type: "course",
                level: "Advanced",
                durationMinutes: 300,
                source: "RapidAPI Provider",
                url: "#",
            }
        ];

        return NextResponse.json({ courses: mockCourses });
    } catch (error) {
        console.error("RapidAPI fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch from RapidAPI" }, { status: 500 });
    }
}
