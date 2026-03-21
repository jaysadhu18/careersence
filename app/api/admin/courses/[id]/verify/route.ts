import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/courses/[id]/verify — Approve or reject course
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { error } = await requireAdmin();
    if (error) return error;

    const { status } = await req.json(); // "PUBLISHED" or "REJECTED"
    if (!["PUBLISHED", "REJECTED"].includes(status))
        return NextResponse.json({ error: "Status must be PUBLISHED or REJECTED" }, { status: 400 });

    const updated = await prisma.course.update({
        where: { id: params.id },
        data: { status },
    });
    return NextResponse.json({ course: updated });
}
