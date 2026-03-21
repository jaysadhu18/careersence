import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyCourseOwner(courseId: string, userId: string) {
    const course = await prisma.course.findFirst({ where: { id: courseId, authorId: userId } });
    return course;
}

// GET /api/instructor/courses/[id] — Get full course with sections + lectures
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await prisma.course.findFirst({
        where: {
            id: params.id,
            OR: [
                { authorId: (session.user as any).id },
                { status: "PUBLISHED" },
            ],
        },
        include: {
            sections: {
                orderBy: { order: "asc" },
                include: { lectures: { orderBy: { order: "asc" } } },
            },
            author: { select: { name: true, organizationName: true } },
        },
    });

    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ course });
}

// PUT /api/instructor/courses/[id] — Update metadata
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await verifyCourseOwner(params.id, (session.user as any).id);
    if (!course) return NextResponse.json({ error: "Not found or no permission" }, { status: 403 });

    const { title, description, price, coverImage } = await req.json();
    const updated = await prisma.course.update({
        where: { id: params.id },
        data: { title, description, price, coverImage },
    });
    return NextResponse.json({ course: updated });
}

// DELETE /api/instructor/courses/[id] — Delete Draft course
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await verifyCourseOwner(params.id, (session.user as any).id);
    if (!course) return NextResponse.json({ error: "Not found or no permission" }, { status: 403 });
    if (course.status !== "DRAFT") return NextResponse.json({ error: "Only DRAFT courses can be deleted" }, { status: 400 });

    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
