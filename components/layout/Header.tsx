"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

const navLinks = [
  { href: "/overview", label: "Overview" },
  { href: "/ai-roadmap", label: "AI Roadmap" },
  { href: "/career-quiz", label: "Career Quiz" },
  { href: "/career-tree", label: "Career Tree" },
  { href: "/learning-resources", label: "Learning" },
  { href: "/job-hunting", label: "Job Hunting" },
  { href: "/college-finder", label: "College Finder" },
  { href: "/analyze", label: "Analyze" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "U";

  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
      role="banner"
    >
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold text-[var(--color-text)] no-underline"
          aria-label="Careersence home"
        >
          <Image src="/icon.png" alt="Careersence logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-[var(--color-primary-600)]">Careersence</span>
        </Link>

        {isLoggedIn && (
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {!isAuthPage && (
            <>
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)]"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="text-sm font-medium">{userInitial}</span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        aria-hidden="true"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div
                        className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[var(--shadow-lg)]"
                        role="menu"
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-[var(--color-text)] no-underline hover:bg-[var(--color-background)]"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <button
                          type="button"
                          className="w-full px-4 py-2 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] sm:block"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-700)]"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text)] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden"
          role="navigation"
          aria-label="Mobile menu"
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {isLoggedIn && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "text-[var(--color-text)]"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="mt-2 flex gap-2 border-t border-[var(--color-border)] pt-3">
                <Link
                  href="/signin"
                  className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-center text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 rounded-lg bg-[var(--color-primary-600)] px-3 py-2 text-center text-sm font-medium text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
