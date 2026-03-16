import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "jay@admin.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin@123";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }

        const emailLower = email.trim().toLowerCase();
        let adminPayload = null;

        // 1. Check hardcoded admin
        if (emailLower === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            adminPayload = { id: "admin-1", email: ADMIN_EMAIL, name: "Admin", role: "admin" };
        } else {
            // 2. Check DB admin
            const user = await prisma.user.findUnique({ where: { email: emailLower } });
            if (user && user.password && !(user as any).disabled && ((user as any).isAdmin || user.role?.toLowerCase() === "admin")) {
                const ok = await bcrypt.compare(password, user.password);
                if (ok) {
                    adminPayload = { id: user.id, email: user.email, name: user.name ?? "Admin", role: "admin" };
                }
            }
        }

        if (!adminPayload) {
            return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
        }

        // Create a secure token specifically for admin
        const token = await encode({
            token: adminPayload as any,
            secret: process.env.NEXTAUTH_SECRET as string,
        });

        // Set cookie
        const cookieStore = cookies();
        (await cookieStore).set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Admin login error", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
