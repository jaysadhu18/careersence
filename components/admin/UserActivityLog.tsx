"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type ActivityType =
  | "registration"
  | "roadmap"
  | "quiz"
  | "career_tree"
  | "resume_analysis"
  | "saved_job";

interface ActivityItem {
  id: string;
  type: ActivityType;
  label: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  detail: string;
  createdAt: string;
}

interface PaginatedActivity {
  items: ActivityItem[];
  total: number;
  page: number;
  totalPages: number;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

const TYPE_CONFIG: Record<
  ActivityType,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  registration: {
    label: "Registration",
    color: "text-[var(--color-primary-700)]",
    bg: "bg-[var(--color-primary-50)]",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  roadmap: {
    label: "Roadmap",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  quiz: {
    label: "Career Quiz",
    color: "text-purple-700",
    bg: "bg-purple-50",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  career_tree: {
    label: "Career Tree",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
  resume_analysis: {
    label: "Resume Analysis",
    color: "text-orange-700",
    bg: "bg-orange-50",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  saved_job: {
    label: "Saved Job",
    color: "text-pink-700",
    bg: "bg-pink-50",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function ActivityBadge({ type }: { type: ActivityType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

interface Props {
  /** If passed, show only this user's activity */
  userId?: string;
  /** Compact table for embedding (no filters, limited rows) */
  compact?: boolean;
}

export function UserActivityLog({ userId: initialUserId, compact = false }: Props) {
  const [data, setData] = useState<PaginatedActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // User picker state
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId ?? "");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fetch user list for picker (not needed when pre-filtered to a single user)
  useEffect(() => {
    if (compact || initialUserId) return;
    fetch("/api/admin/users?limit=200&page=1")
      .then((r) => r.json())
      .then((d) => setUserOptions(d.users ?? []))
      .catch(() => {});
  }, [compact, initialUserId]);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (selectedUserId) params.set("userId", selectedUserId);
      const res = await fetch(`/api/admin/activity?${params}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [page, selectedUserId]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [selectedUserId]);

  const items = data?.items ?? [];

  const selectedUser = userOptions.find((u) => u.id === selectedUserId) ?? null;
  const filteredUserOptions = userOptions.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name ?? "").toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      {!compact && (
        <div className="space-y-3">
          {/* User picker – hidden when pre-filtered to a specific user */}
          {!initialUserId && (
            <div className="flex items-center gap-3">
            <div className="relative w-72" ref={pickerRef}>
              <button
                onClick={() => setPickerOpen((o) => !o)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedUserId
                    ? "border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                    : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-muted)]"
                } hover:border-[var(--color-primary-400)]`}
              >
                <span className="flex items-center gap-2 truncate">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="truncate">
                    {selectedUser
                      ? (selectedUser.name ?? selectedUser.email)
                      : "All Users"}
                  </span>
                </span>
                <svg className={`h-4 w-4 shrink-0 transition-transform ${pickerOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {pickerOpen && (
                <div className="absolute left-0 top-full z-30 mt-1 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
                  {/* Search input */}
                  <div className="border-b border-[var(--color-border)] p-2">
                    <div className="relative">
                      <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search users…"
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] py-1.5 pl-7 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary-500)]"
                      />
                    </div>
                  </div>

                  {/* Options list */}
                  <ul className="max-h-56 overflow-y-auto py-1">
                    {/* All users option */}
                    <li>
                      <button
                        onClick={() => { setSelectedUserId(""); setUserSearch(""); setPickerOpen(false); }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--color-background)] ${
                          !selectedUserId ? "font-semibold text-[var(--color-primary-600)]" : "text-[var(--color-text)]"
                        }`}
                      >
                        <svg className="h-4 w-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        All Users
                      </button>
                    </li>

                    {filteredUserOptions.length === 0 ? (
                      <li className="px-3 py-4 text-center text-xs text-[var(--color-text-muted)]">No users found</li>
                    ) : (
                      filteredUserOptions.map((u) => (
                        <li key={u.id}>
                          <button
                            onClick={() => { setSelectedUserId(u.id); setUserSearch(""); setPickerOpen(false); }}
                            className={`flex w-full items-start gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-background)] ${
                              selectedUserId === u.id ? "bg-[var(--color-primary-50)]" : ""
                            }`}
                          >
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white">
                              {(u.name ?? u.email)[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className={`truncate font-medium ${selectedUserId === u.id ? "text-[var(--color-primary-700)]" : "text-[var(--color-text)]"}`}>
                                {u.name ?? <span className="italic text-[var(--color-text-muted)]">No name</span>}
                              </p>
                              <p className="truncate text-xs text-[var(--color-text-muted)]">{u.email}</p>
                            </div>
                            {selectedUserId === u.id && (
                              <svg className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Clear user filter pill */}
            {selectedUser && (
              <button
                onClick={() => setSelectedUserId("")}
                className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-semibold text-[var(--color-primary-700)] hover:bg-[var(--color-primary-200)] transition-colors"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filter
              </button>
            )}

            {data && (
              <span className="ml-auto text-xs text-[var(--color-text-muted)]">
                {data.total} event{data.total !== 1 ? "s" : ""}
                {selectedUser ? ` for ${selectedUser.name ?? selectedUser.email}` : ""}
              </span>
            )}
          </div>
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
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">No activity found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Activity</th>
                {!selectedUserId && (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">User</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Detail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-[var(--color-background)]">
                  <td className="px-4 py-3">
                    <ActivityBadge type={item.type} />
                  </td>
                  {!selectedUserId && (
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-text)]">
                        {item.userName ?? <span className="text-[var(--color-text-muted)]">—</span>}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.userEmail}</p>
                    </td>
                  )}
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate text-[var(--color-text-muted)]">{item.detail}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-muted)]">
                    <span title={new Date(item.createdAt).toLocaleString("en-IN")}>
                      {timeAgo(item.createdAt)}
                    </span>
                    <p className="text-xs opacity-60">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!compact && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            Page {page} of {data.totalPages}
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
                    className={`min-w-[2rem] rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      p === page
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
    </div>
  );
}
