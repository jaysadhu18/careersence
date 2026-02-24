import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch all saved jobs for the current user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.savedJob.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ jobs });
}

// POST — save a new job
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, title, company, location, url, source } = body;

    if (!jobId || !title || !company || !url) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const job = await prisma.savedJob.upsert({
        where: { userId_jobId: { userId: session.user.id, jobId } },
        create: {
            userId: session.user.id,
            jobId,
            title,
            company,
            location: location ?? "",
            url,
            source: source ?? "jsearch",
            status: "saved",
        },
        update: {},
    });

    return NextResponse.json({ job });
}

// PATCH — update job status
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    const validStatuses = ["saved", "applied", "interviewing", "offer", "rejected"];
    if (!id || !validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const job = await prisma.savedJob.updateMany({
        where: { id, userId: session.user.id },
        data: { status },
    });

    return NextResponse.json({ updated: job.count });
}

// DELETE — remove a saved job
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.savedJob.deleteMany({
        where: { id, userId: session.user.id },
    });

    return NextResponse.json({ ok: true });
}
