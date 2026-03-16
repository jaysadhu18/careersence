import { getToken } from "next-auth/jwt";
import { decode } from "next-auth/jwt";
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

  // ── Admin section ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminTokenCookie = request.cookies.get("admin_token")?.value;
    let isAdmin = false;

    if (adminTokenCookie) {
      try {
        const decodedAdmin = await decode({
          token: adminTokenCookie,
          secret: process.env.NEXTAUTH_SECRET as string,
        });
        if (decodedAdmin && decodedAdmin.role === "admin") {
          isAdmin = true;
        }
      } catch (err) { }
    }

    // Admin login page: redirect to dashboard if already admin
    if (pathname === "/admin/login") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // All other /admin/* routes require admin role
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Regular user routes ────────────────────────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

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
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
