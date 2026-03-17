import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Fetch all resources with user info
        const resources = await prisma.internalResource.findMany({
            include: {
                submittedBy: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                        organizationName: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ resources });

    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
