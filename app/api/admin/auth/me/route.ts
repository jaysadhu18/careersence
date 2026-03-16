import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = cookies();
        const tokenCookie = (await cookieStore).get("admin_token")?.value;

        if (!tokenCookie) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const decoded = await decode({
            token: tokenCookie,
            secret: process.env.NEXTAUTH_SECRET as string,
        });

        if (decoded && decoded.role === "admin") {
            return NextResponse.json({ user: decoded });
        }

        return NextResponse.json({ user: null }, { status: 401 });
    } catch (err) {
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
