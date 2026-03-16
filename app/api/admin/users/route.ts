import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

import bcrypt from "bcryptjs";

const PAGE_SIZE = 10;

/** POST /api/admin/users - Create a new admin */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name || undefined,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        // @ts-ignore
        isAdmin: true,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // @ts-ignore
        isAdmin: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ message: "Admin created successfully", user: newUser }, { status: 201 });
  } catch (err: any) {
    console.error("Failed to create admin:", err);
    return NextResponse.json({ error: "Failed to create admin account" }, { status: 500 });
  }
}

/** GET /api/admin/users?page=1&search=&limit=10 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10));
  const search = (searchParams.get("search") ?? "").trim();
  const roleFilter = searchParams.get("role")?.toLowerCase();

  const where: any = search
    ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }
    : {};

  if (roleFilter === "admins") {
    // @ts-ignore
    where.isAdmin = true;
  } else if (roleFilter === "users") {
    // @ts-ignore
    where.isAdmin = false;
  }

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
            // @ts-ignore
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
