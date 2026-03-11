import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** GET /api/admin/users/[id] */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true, disabled: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() });
}

/** PUT /api/admin/users/[id]  — edit user info or toggle disabled */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, email, phone, disabled, password } = body as {
    name?: string;
    email?: string;
    phone?: string;
    disabled?: boolean;
    password?: string;
  };

  // Prevent editing the fake admin account
  if (id === "admin") {
    return NextResponse.json({ error: "Cannot edit the admin account" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (disabled !== undefined) updateData.disabled = disabled;
  if (email !== undefined && email.trim()) updateData.email = email.trim().toLowerCase();
  if (password) updateData.password = await bcrypt.hash(password, 10);

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true, disabled: true, createdAt: true },
    });
    return NextResponse.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: "Update failed — email may already be in use" }, { status: 400 });
  }
}

/** DELETE /api/admin/users/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (id === "admin") {
    return NextResponse.json({ error: "Cannot delete the admin account" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
