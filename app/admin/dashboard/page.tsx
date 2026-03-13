import Link from "next/link";
import { AdminOverviewCharts } from "@/components/admin/AdminOverviewCharts";
import { StatCards } from "@/components/admin/StatCards";
import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Welcome back, Admin 👋</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Here&apos;s what&apos;s happening on CareerSence today.
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-700)]"
        >
          Manage Users →
        </Link>
      </div>

      {/* Stat cards */}
      <StatCards />

      {/* Visual analytics */}
      <AdminOverviewCharts />

      {/* Recent users preview */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Recent Registrations</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Last 5 users who joined</p>
          </div>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
          >
            View all →
          </Link>
        </div>
        <UserManagement compact />
      </div>
    </div>
  );
}
