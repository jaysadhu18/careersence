import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const courses = await prisma.course.findMany({
        where: { authorId: (session.user as any).id },
        include: { sections: { include: { lectures: true } } },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ courses });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, price } = await req.json();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const course = await prisma.course.create({
        data: {
            title,
            description: description || "",
            price: price || 0,
            status: "DRAFT",
            authorId: (session.user as any).id,
        },
    });
    return NextResponse.json({ course });
}
