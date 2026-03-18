import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const resources = await prisma.internalResource.findMany({
            include: {
                submittedBy: {
                    select: { name: true, email: true, role: true, organizationName: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ resources });
    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
