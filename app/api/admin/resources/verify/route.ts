import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { resource_id, status } = body;

        if (!resource_id || !status) {
            return NextResponse.json({ error: "resource_id and status are required" }, { status: 400 });
        }

        const validStatuses = ["approved", "rejected"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "status must be 'approved' or 'rejected'" }, { status: 400 });
        }

        const updatedResource = await prisma.internalResource.update({
            where: { id: resource_id },
            data: { status }
        });

        return NextResponse.json({
            action: "verification_update",
            resource_id: updatedResource.id,
            status: updatedResource.status
        });

    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
