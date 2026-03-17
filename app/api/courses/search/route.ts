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
        const DEV_API_KEY = process.env.DEV_API;

        let ytCourses: any[] = [];
        let devArticles: any[] = [];

        // 1. Fetch from YouTube
        if (YOUTUBE_API_KEY) {
            const ytResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(
                    q + " course tutorial"
                )}&type=video&key=${YOUTUBE_API_KEY}`
            );

            if (!ytResponse.ok) {
                console.error("YouTube API failed:", await ytResponse.text());
            } else {
                const data = await ytResponse.json();

                if (data.items && data.items.length > 0) {
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

                    ytCourses = data.items.map((item: any) => ({
                        id: `yt-${item.id.videoId}`,
                        title: item.snippet.title,
                        description: item.snippet.description || "Video tutorial",
                        type: "video",
                        level: "All Levels",
                        durationMinutes: durationsMap[item.id.videoId] || 0,
                        source: item.snippet.channelTitle || "YouTube",
                        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    }));
                }
            }
        } else {
            console.warn("YOUTUBE_API key is missing in .env.local!");
        }

        // 2. Fetch from DEV.to API for Articles
        if (DEV_API_KEY) {
            const devResponse = await fetch(`https://dev.to/api/articles/search?q=${encodeURIComponent(q)}&per_page=15`, {
                headers: { "api-key": DEV_API_KEY }
            });

            if (devResponse.ok) {
                const devData = await devResponse.json();
                if (Array.isArray(devData)) {
                    devArticles = devData.map((article: any) => ({
                        id: `dev-${article.id}`,
                        title: article.title,
                        description: article.description || "Tech article on Dev.to",
                        type: "article",
                        level: "All Levels", // No exact level mapping for DEV
                        durationMinutes: article.reading_time_minutes || 5, // Translate read time symmetrically
                        source: article.user?.name || "Dev.to community",
                        url: article.url,
                    }));
                }
            } else {
                console.error("DEV API failed:", await devResponse.text());
            }
        } else {
            console.warn("DEV_API key is missing in .env.local!");
        }

        // Combine both sources
        const combined = [...ytCourses, ...devArticles];

        // Shuffle logically to interleave articles and videos randomly but efficiently
        combined.sort(() => Math.random() - 0.5);

        return NextResponse.json({ courses: combined });
    } catch (error) {
        console.error("API fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch from APIs" }, { status: 500 });
    }
}
