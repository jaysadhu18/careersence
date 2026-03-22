"use client";

import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      if (pathname === "/admin/login") {
        setIsAuthorized(true);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          setIsAuthorized(true);
        } else {
          router.push("/signin");
        }
      } catch (err) {
        router.push("/signin");
      }
    }
    checkAuth();
  }, [pathname, router]);

  // Login page gets a clean full-screen layout (no sidebar)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Prevent flash of content while checking auth
  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <img src="/logo.png" alt="logo" className="h-16 w-16 object-contain animate-bounce" />
      </div>
    );
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
