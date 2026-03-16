import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminAdminsPage() {
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Admin Management</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Search, view, create, edit, disable, or delete platform administrators.
                </p>
            </div>

            {/* Full admin management table */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
                <UserManagement listRole="admins" />
            </div>
        </div>
    );
}
