import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // "countries", "states", "cities"
        const country = searchParams.get("country");
        const state = searchParams.get("state");

        const filePath = path.join(process.cwd(), "data", "locations.json");
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Location data not found" }, { status: 404 });
        }

        const fileContent = fs.readFileSync(filePath, "utf-8");
        const locationsData = JSON.parse(fileContent);

        if (type === "countries") {
            const countries = Object.keys(locationsData).sort();
            return NextResponse.json(countries);
        }

        if (type === "states") {
            if (!country || !locationsData[country]) {
                return NextResponse.json([], { status: 200 }); // Return empty if country not found
            }
            const states = Object.keys(locationsData[country]).sort();
            return NextResponse.json(states);
        }

        if (type === "cities") {
            if (!country || !state || !locationsData[country] || !locationsData[country][state]) {
                return NextResponse.json([], { status: 200 }); // Return empty if not found
            }
            const cities = [...new Set<string>(locationsData[country][state])];
            return NextResponse.json(cities); // Already sorted in JSON
        }

        return NextResponse.json({ error: "Invalid type requested" }, { status: 400 });

    } catch (error) {
        console.error("Location API Error:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
}
