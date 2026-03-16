import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

/**
 * Call this at the top of admin API route handlers.
 * Returns the session if the caller is the admin, or a 401 NextResponse.
 */
export async function requireAdmin() {
  const cookieStore = cookies();
  const tokenCookie = (await cookieStore).get("admin_token")?.value;

  if (!tokenCookie) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const decoded = await decode({
      token: tokenCookie,
      secret: process.env.NEXTAUTH_SECRET as string,
    });

    if (!decoded || decoded.role !== "admin") {
      throw new Error("Invalid token role");
    }

    return { session: { user: decoded }, error: null };
  } catch (err) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
