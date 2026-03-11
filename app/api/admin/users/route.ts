import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

/** GET /api/admin/users?page=1&search=&limit=10 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10));
  const search = (searchParams.get("search") ?? "").trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        disabled: true,
        createdAt: true,
        _count: {
          select: {
            roadmaps: true,
            savedJobs: true,
            quizSessions: true,
            careerTrees: true,
            resumeAnalyses: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
