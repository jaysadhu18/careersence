import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/progress/[lectureId] — Mark lecture complete/incomplete
export async function PUT(req: NextRequest, props: { params: Promise<{ lectureId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isComplete } = await req.json();
    const studentId = (session.user as any).id;

    const progress = await prisma.progress.upsert({
        where: { studentId_lectureId: { studentId, lectureId: params.lectureId } },
        create: { studentId, lectureId: params.lectureId, isComplete: !!isComplete },
        update: { isComplete: !!isComplete },
    });
    return NextResponse.json({ progress });
}
