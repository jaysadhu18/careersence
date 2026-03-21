import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

// POST /api/sections/[id]/lectures — Add lecture with optional file upload
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify the section belongs to a course owned by this user
    const section = await prisma.section.findFirst({
        where: { id: params.id },
        include: { course: true },
    });
    if (!section || section.course.authorId !== (session.user as any).id)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const type = formData.get("type") as string; // VIDEO, PDF, QUIZ
    const textContent = formData.get("textContent") as string;
    const file = formData.get("file") as File | null;

    if (!title || !type) return NextResponse.json({ error: "title and type are required" }, { status: 400 });

    let contentUrl: string | null = null;
    if (file && typeof file === "object") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/lectures");
        try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }
        await fs.writeFile(path.join(uploadDir, fileName), buffer);
        contentUrl = `/uploads/lectures/${fileName}`;
    }

    const count = await prisma.lecture.count({ where: { sectionId: params.id } });
    const lecture = await prisma.lecture.create({
        data: {
            title,
            type,
            contentUrl,
            textContent: textContent || null,
            duration: null,
            order: count + 1,
            sectionId: params.id,
        },
    });
    return NextResponse.json({ lecture });
}

// GET /api/sections/[id]/lectures
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const lectures = await prisma.lecture.findMany({
        where: { sectionId: params.id },
        orderBy: { order: "asc" },
    });
    return NextResponse.json({ lectures });
}
