"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page gets a clean full-screen layout (no sidebar)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto px-12 py-4">{children}</main>
      </div>
    </div>
  );
}
