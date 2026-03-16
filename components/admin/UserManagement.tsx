"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { UserActivityLog } from "@/components/admin/UserActivityLog";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  disabled: boolean;
  createdAt: string;
  _count: {
    roadmaps: number;
    savedJobs: number;
    quizSessions: number;
    careerTrees: number;
    resumeAnalyses: number;
  };
}

interface PaginatedResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const PAGE_SIZE = 10;

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`} />
      {active ? "Active" : "Disabled"}
    </span>
  );
}

export function UserManagement({ compact = false, listRole = "users" }: { compact?: boolean, listRole?: "admins" | "users" }) {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create Admin modal
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({ name: "", email: "", password: "" });
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState("");

  // Edit modal
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", email: "", phone: "", password: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle loading per user
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Inline activity expansion per user
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  function toggleActivity(userId: string) {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        limit: String(compact ? 5 : PAGE_SIZE),
        role: listRole,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, search, compact, listRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  }

  function openEdit(user: AdminUser) {
    setEditUser(user);
    setEditForm({ name: user.name ?? "", email: user.email, phone: user.phone ?? "", password: "" });
    setEditError("");
  }

  async function handleEditSave() {
    if (!editUser) return;
    setEditLoading(true);
    setEditError("");
    const body: Record<string, string> = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
    };
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditLoading(false);
    if (!res.ok) {
      const err = await res.json();
      setEditError(err.error ?? "Update failed");
      return;
    }
    setEditUser(null);
    fetchUsers();
  }

  async function handleCreateAdmin() {
    setCreateAdminLoading(true);
    setCreateAdminError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createAdminForm),
    });
    setCreateAdminLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setCreateAdminError(err.error ?? "Failed to create admin");
      return;
    }

    setCreateAdminOpen(false);
    setCreateAdminForm({ name: "", email: "", password: "" });
    setPage(1);
    fetchUsers();
  }

  async function handleToggleDisabled(user: AdminUser) {
    setTogglingId(user.id);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled: !user.disabled }),
    });
    setTogglingId(null);
    fetchUsers();
  }

  async function handleDelete() {
    if (!deleteUser) return;
    setDeleteLoading(true);
    await fetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" });
    setDeleteLoading(false);
    setDeleteUser(null);
    if (data && data.users.length === 1 && page > 1) setPage(page - 1);
    else fetchUsers();
  }

  const users = data?.users ?? [];

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            />
          </div>
          {data && (
            <p className="shrink-0 text-sm text-[var(--color-text-muted)]">
              {data.total} {listRole === "admins" ? "admin" : "user"}{data.total !== 1 ? "s" : ""}
            </p>
          )}
          {listRole === "admins" && (
            <button
              onClick={() => {
                setCreateAdminForm({ name: "", email: "", password: "" });
                setCreateAdminError("");
                setCreateAdminOpen(true);
              }}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-700)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Admin
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="h-6 w-6 animate-spin text-[var(--color-primary-600)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Status</th>
                {!compact && (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Activity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users.map((user) => (
                <React.Fragment key={user.id}>
                  <tr className="transition-colors hover:bg-[var(--color-background)]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">{user.id.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {user.name ?? <span className="text-[var(--color-text-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{user.email}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge active={!user.disabled} />
                    </td>
                    {!compact && (
                      <>
                        {/* Activity column – click to expand inline */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActivity(user.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${expandedUserId === user.id
                                ? "bg-[var(--color-primary-600)] text-white"
                                : "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)]"
                              }`}
                            title="Click to view activity"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {expandedUserId === user.id ? "Hide Activity" : "View Activity"}
                            <svg className={`h-3 w-3 transition-transform ${expandedUserId === user.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit */}
                            <button
                              onClick={() => openEdit(user)}
                              title="Edit user"
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-primary-600)]"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Toggle disabled */}
                            <button
                              onClick={() => handleToggleDisabled(user)}
                              disabled={togglingId === user.id}
                              title={user.disabled ? "Enable user" : "Disable user"}
                              className={`rounded-lg p-1.5 transition-colors ${user.disabled
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-yellow-600 hover:bg-yellow-50"
                                } disabled:opacity-50`}
                            >
                              {togglingId === user.id ? (
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              ) : user.disabled ? (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              )}
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteUser(user)}
                              title="Delete user"
                              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Inline activity panel */}
                  {!compact && expandedUserId === user.id && (
                    <tr>
                      <td colSpan={7} className="border-t-0 bg-[var(--color-background)] px-4 pb-6 pt-4">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-sm font-bold text-white">
                            {(user.name ?? user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {user.name ?? <span className="italic text-[var(--color-text-muted)]">No name</span>}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                          </div>
                          <span className="ml-auto text-xs text-[var(--color-text-muted)]">Activity Log</span>
                        </div>
                        <UserActivityLog userId={user.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!compact && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-[var(--color-text-muted)]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`min-w-[2rem] rounded-lg border px-3 py-1.5 text-sm transition-colors ${p === page
                        ? "border-[var(--color-primary-600)] bg-[var(--color-primary-600)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-background)]"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-background)]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {editError}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Full name" },
                { label: "Email", key: "email", type: "email", placeholder: "email@example.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
                { label: "New Password", key: "password", type: "password", placeholder: "Leave blank to keep current" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--color-text)]">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof EditForm]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:opacity-60"
              >
                {editLoading && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Admin Modal ───────────────────────────────── */}
      {createAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Create New Admin</h2>
              <button onClick={() => setCreateAdminOpen(false)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-background)]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {createAdminError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {createAdminError}
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Akshat" },
                { label: "Email*", key: "email", type: "email", placeholder: "akshat@admin.com" },
                { label: "Password*", key: "password", type: "password", placeholder: "Required" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--color-text)]">{label}</label>
                  <input
                    type={type}
                    value={(createAdminForm as any)[key]}
                    onChange={(e) => setCreateAdminForm({ ...createAdminForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCreateAdminOpen(false)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={createAdminLoading || !createAdminForm.email || !createAdminForm.password}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-700)] disabled:opacity-60"
              >
                {createAdminLoading && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Delete User?</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[var(--color-text)]">{deleteUser.name ?? deleteUser.email}</strong>?
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteUser(null)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
