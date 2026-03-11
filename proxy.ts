import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/signin", "/signup", "/admin/login"];
const authPaths = ["/signin", "/signup"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static and all API routes through (they handle their own auth)
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ── Admin section ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Admin login page: redirect to dashboard if already admin
    if (pathname === "/admin/login") {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // All other /admin/* routes require admin role
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Regular routes ────────────────────────────────────────────────────
  const isPublic = publicPaths.includes(pathname);
  const isAuthPage = authPaths.includes(pathname);

  // Not signed in
  if (!token) {
    if (isPublic) return NextResponse.next();
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  // Signed in: redirect away from signin/signup
  if (isAuthPage) {
    const dest = token.role === "admin" ? "/admin/dashboard" : "/overview";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
