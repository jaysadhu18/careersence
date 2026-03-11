"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin routes have their own full-screen layout — no wrapper here
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  );
}
