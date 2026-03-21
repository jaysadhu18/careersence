import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/instructor/courses/[id]/sections — Add section
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findFirst({
        where: { id: params.id, authorId: (session.user as any).id },
    });
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: "Section title is required" }, { status: 400 });

    const count = await prisma.section.count({ where: { courseId: params.id } });
    const section = await prisma.section.create({
        data: { title, order: count + 1, courseId: params.id },
    });
    return NextResponse.json({ section });
}

// GET /api/instructor/courses/[id]/sections — List sections
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const sections = await prisma.section.findMany({
        where: { courseId: params.id },
        orderBy: { order: "asc" },
        include: { lectures: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ sections });
}
