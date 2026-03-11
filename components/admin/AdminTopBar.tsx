"use client";

import { usePathname } from "next/navigation";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "User Management",
};

export function AdminTopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin Panel";

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text)]">{title}</h1>
        <p className="text-xs text-[var(--color-text-muted)]">CareerSence Administration</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-700)] sm:inline">
          Admin
        </span>
        <DarkModeToggle />
      </div>
    </header>
  );
}
