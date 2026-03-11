import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "jay@admin.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin@123";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();

        // ── Admin hard-coded credentials ──────────────────────────────────
        if (email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
          return {
            id: "admin",
            email: ADMIN_EMAIL,
            name: "Admin",
            role: "admin",
          };
        }

        // ── Regular user credentials ──────────────────────────────────────
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        // Prevent disabled users from logging in
        if ((user as any).disabled) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: "user",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role ?? "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
