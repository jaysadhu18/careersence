"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

const navLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-600)]">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">Admin Panel</p>
          <p className="text-xs text-[var(--color-text-muted)]">CareerSence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Main
        </p>
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <span className={isActive ? "text-[var(--color-primary-600)]" : ""}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Account
          </p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Admin badge */}
      <div className="border-t border-[var(--color-border)] p-4">
        <div className="flex items-center gap-3 rounded-lg bg-[var(--color-primary-50)] px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-sm font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">Admin</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">jay@admin.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
