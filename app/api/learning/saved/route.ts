import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // @ts-ignore - Prisma types might not have caught up in the IDE yet
        const saved = await prisma.savedResource.findMany({
            where: { user: { email: session.user.email } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ resources: saved });
    } catch (error) {
        console.error("Failed to fetch saved resources:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { resourceId, title, description, url, type, source } = body;

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // @ts-ignore - Prisma types might not have caught up in the IDE yet
        const newResource = await prisma.savedResource.create({
            data: {
                userId: user.id,
                resourceId,
                title,
                description: description || "",
                url,
                type: type || "video",
                source: source || "YouTube",
            },
        });

        return NextResponse.json({ success: true, resource: newResource });
    } catch (error) {
        console.error("Failed to save resource:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = req.nextUrl;
        const resourceId = searchParams.get("resourceId");

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user || !resourceId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

        // @ts-ignore - Prisma types might not have caught up in the IDE yet
        await prisma.savedResource.delete({
            where: { userId_resourceId: { userId: user.id, resourceId } },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to unset resource:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
