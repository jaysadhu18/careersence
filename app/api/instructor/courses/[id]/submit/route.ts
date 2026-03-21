import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/instructor/courses/[id]/submit — Submit course for admin review
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findFirst({
        where: { id: params.id, authorId: (session.user as any).id },
        include: { sections: { include: { lectures: true } } },
    });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (course.status !== "DRAFT" && course.status !== "REJECTED")
        return NextResponse.json({ error: "Only DRAFT or REJECTED courses can be submitted" }, { status: 400 });

    // Must have at least 1 section with 1 lecture
    const hasContent = course.sections.some((s) => s.lectures.length > 0);
    if (!hasContent) return NextResponse.json({ error: "Course must have at least one section with a lecture" }, { status: 400 });

    const updated = await prisma.course.update({
        where: { id: params.id },
        data: { status: "PENDING" },
    });
    return NextResponse.json({ course: updated });
}
