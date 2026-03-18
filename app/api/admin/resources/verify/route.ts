import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const { resource_id, status } = await req.json();

        if (!resource_id || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "resource_id and valid status required" }, { status: 400 });
        }

        const updated = await prisma.internalResource.update({
            where: { id: resource_id },
            data: { status }
        });

        return NextResponse.json({ action: "verification_update", resource_id: updated.id, status: updated.status });
    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
