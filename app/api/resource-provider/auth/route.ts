import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role, organization_name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const validRoles = ["individual", "institute", "university"];
        const userRole = validRoles.includes(role) ? role : "individual";

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Treat as login if existing
            const isValid = await bcrypt.compare(password, existingUser.password);
            if (!isValid) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            return NextResponse.json({
                action: "login",
                user_id: existingUser.id,
                role: existingUser.role,
            });
        }

        // Register new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: name || "",
                email,
                password: hashedPassword,
                role: userRole,
                organizationName: organization_name || null,
            },
        });

        return NextResponse.json({
            action: "register",
            user_id: newUser.id,
            role: newUser.role,
        });

    } catch (e) {
        return NextResponse.json({ error: "Server error", details: String(e) }, { status: 500 });
    }
}
