"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/ai-roadmap", label: "AI Roadmap" },
  { href: "/career-quiz", label: "Career Quiz" },
  { href: "/career-tree", label: "Career Tree" },
  { href: "/learning-resources", label: "Learning" },
  { href: "/job-hunting", label: "Job Hunting" },
  { href: "/college-finder", label: "College Finder" },
  { href: "/analyze", label: "Analyze" },
];

export function OverviewSidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]"
      aria-label="Overview navigation"
    >
      <ul className="space-y-1" role="list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
