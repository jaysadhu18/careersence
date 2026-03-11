import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">User Management</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Search, view, edit, disable, or delete registered users.
        </p>
      </div>

      {/* Full user management table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
        <UserManagement />
      </div>
    </div>
  );
}
