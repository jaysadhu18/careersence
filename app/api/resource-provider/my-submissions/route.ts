import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
        return NextResponse.json({ error: "userId or email required" }, { status: 400 });
    }

    let submittedById = userId;

    if (!submittedById && email) {
        const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (!user) return NextResponse.json({ resources: [] });
        submittedById = user.id;
    }

    const resources = await prisma.internalResource.findMany({
        where: { submittedById: submittedById! },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ resources });
}
