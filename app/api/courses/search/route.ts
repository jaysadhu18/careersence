import { NextRequest, NextResponse } from "next/server";

// Helper to parse ISO 8601 duration from YouTube (e.g., PT1H30M15S)
function parseIsoDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 60 + minutes + (seconds > 30 ? 1 : 0);
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ courses: [] });
    }

    try {
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API;

        if (!YOUTUBE_API_KEY) {
            console.warn("YOUTUBE_API key is missing in .env.local!");
            return NextResponse.json({ courses: [] });
        }

        // Call the original YouTube v3 API
        const ytResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(
                q + " course tutorial"
            )}&type=video&key=${YOUTUBE_API_KEY}`
        );

        if (!ytResponse.ok) {
            console.error("YouTube API failed:", await ytResponse.text());
            return NextResponse.json({ error: "Failed to fetch from YouTube API" }, { status: 500 });
        }

        const data = await ytResponse.json();

        if (!data.items || data.items.length === 0) {
            return NextResponse.json({ courses: [] });
        }

        const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean).join(",");
        const durationsMap: Record<string, number> = {};

        if (videoIds) {
            const detailsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            );
            if (detailsRes.ok) {
                const detailsData = await detailsRes.json();
                detailsData.items?.forEach((vid: any) => {
                    durationsMap[vid.id] = parseIsoDuration(vid.contentDetails.duration);
                });
            }
        }

        // Map the YouTube API response into our internal Course/Resource format
        const ytCourses = data.items.map((item: any) => ({
            id: `yt-${item.id.videoId}`,
            title: item.snippet.title,
            description: item.snippet.description,
            type: "video",
            level: "All Levels",
            durationMinutes: durationsMap[item.id.videoId] || 0,
            source: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        return NextResponse.json({ courses: ytCourses });
    } catch (error) {
        console.error("RapidAPI fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch from RapidAPI" }, { status: 500 });
    }
}
