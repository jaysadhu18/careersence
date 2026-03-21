import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/courses/pending
export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    const courses = await prisma.course.findMany({
        where: { status: "PENDING" },
        include: {
            author: { select: { name: true, email: true, organizationName: true, role: true } },
            sections: { include: { lectures: true } },
        },
        orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ courses });
}
