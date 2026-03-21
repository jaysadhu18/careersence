import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/enrollments — Enroll current user in a course
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

    const course = await prisma.course.findFirst({ where: { id: courseId, status: "PUBLISHED" } });
    if (!course) return NextResponse.json({ error: "Course not found or not published" }, { status: 404 });

    // Idempotent — upsert ensures no duplicate enrollments
    const enrollment = await prisma.enrollment.upsert({
        where: { studentId_courseId: { studentId: (session.user as any).id, courseId } },
        create: { studentId: (session.user as any).id, courseId },
        update: {},
    });
    return NextResponse.json({ enrollment });
}

// GET /api/enrollments — List enrolled courses for current user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const enrollments = await prisma.enrollment.findMany({
        where: { studentId: (session.user as any).id },
        include: {
            course: {
                include: {
                    sections: { include: { lectures: true } },
                    author: { select: { name: true } },
                },
            },
        },
        orderBy: { enrolledAt: "desc" },
    });
    return NextResponse.json({ enrollments });
}
