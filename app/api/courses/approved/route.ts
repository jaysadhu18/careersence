import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const resources = await prisma.internalResource.findMany({
        where: { status: "approved" },
        include: {
            submittedBy: { select: { name: true, organizationName: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    const courses = resources.map((r) => ({
        id: `internal-${r.id}`,
        title: r.title || r.courseTitle,
        description: r.description || r.courseDescription || r.summary || "",
        type: r.resourceType,
        level: r.level || "All Levels",
        durationMinutes:
            (r.durationSeconds ? Math.round(r.durationSeconds / 60) : null) ??
            r.readTimeMinutes ??
            r.totalDuration ??
            0,
        source: r.submittedBy.organizationName || r.submittedBy.name || "Provider",
        url: r.videoFilePath || "#",
    }));

    return NextResponse.json({ courses });
}
