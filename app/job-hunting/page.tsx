"use client";

import { useState, useEffect, useCallback } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
}

interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  status: string;
  updatedAt: string;
}

type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-yellow-100 text-yellow-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobHuntingPage() {
  const [tab, setTab] = useState<"discover" | "saved">("discover");

  // ── Discover tab state ──
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("India");
  const [discovering, setDiscovering] = useState(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);
  const [discoverError, setDiscoverError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // ── My Applications tab state ──
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Load saved jobs ──
  const loadSavedJobs = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/jobs/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.jobs ?? []);
        setSavedIds(new Set((data.jobs ?? []).map((j: SavedJob) => j.jobId)));
      }
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  // ── Search jobs ──
  const searchJobs = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setDiscoverError("");
    setDiscovering(true);
    try {
      const params = new URLSearchParams({
        query: query || "software engineer",
        location: location || "India",
      });
      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setDiscoverError(data.error || "Failed to fetch jobs.");
        return;
      }
      setDiscoveredJobs(data.jobs ?? []);
    } catch {
      setDiscoverError("Network error. Please try again.");
    } finally {
      setDiscovering(false);
    }
  };

  // ── Save a discovered job ──
  const saveJob = async (job: DiscoveredJob) => {
    setSavingId(job.id);
    try {
      const res = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          source: job.source,
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set([...prev, job.id]));
        await loadSavedJobs();
      }
    } finally {
      setSavingId(null);
    }
  };

  // ── Update job status ──
  const updateStatus = async (id: string, status: JobStatus) => {
    setUpdatingId(id);
    try {
      await fetch("/api/jobs/saved", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setSavedJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status } : j))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete a saved job ──
  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/saved?id=${id}`, { method: "DELETE" });
    setSavedJobs((prev) => prev.filter((j) => j.id !== id));
  };

  // ── Stats ──
  const stats = {
    saved: savedJobs.filter((j) => j.status === "saved").length,
    applied: savedJobs.filter((j) => j.status === "applied").length,
    interviewing: savedJobs.filter((j) => j.status === "interviewing").length,
    offer: savedJobs.filter((j) => j.status === "offer").length,
  };

  return (
    <PageShell
      title="Job Hunting"
      description="Search real jobs from Naukri, LinkedIn, Indeed and more. Track your applications."
      maxWidth="xl"
    >
      {/* Stats bar */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Saved", value: stats.saved },
          { label: "Applied", value: stats.applied },
          { label: "Interviewing", value: stats.interviewing },
          { label: "Offers", value: stats.offer },
        ].map(({ label, value }) => (
          <Card key={label} padding="md">
            <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          </Card>
        ))}
      </section>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[var(--color-border)]">
        {(["discover", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t
                ? "border-b-2 border-[var(--color-primary-600)] text-[var(--color-primary-600)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
          >
            {t === "discover" ? "🔍 Discover Jobs" : `📋 My Applications (${savedJobs.length})`}
          </button>
        ))}
      </div>

      {/* ── DISCOVER TAB ── */}
      {tab === "discover" && (
        <div className="space-y-6">
          {/* Search form */}
          <Card padding="md">
            <form onSubmit={searchJobs} className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label="Job title or keywords"
                  placeholder="e.g. Software Engineer, Data Analyst"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Input
                  label="Location"
                  placeholder="e.g. India, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" loading={discovering}>
                  Search Jobs
                </Button>
              </div>
            </form>
          </Card>

          {discoverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {discoverError}
              {discoverError.includes("RAPIDAPI_KEY") && (
                <p className="mt-1 font-medium">
                  Add <code className="rounded bg-red-100 px-1">RAPIDAPI_KEY=your_key</code> to your{" "}
                  <code>.env.local</code> file.
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {discoveredJobs.length === 0 && !discovering && !discoverError && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 font-medium text-[var(--color-text)]">Search for jobs above</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Results are pulled live from Naukri, LinkedIn, Indeed, and more.
              </p>
            </div>
          )}

          {discovering && (
            <div className="py-16 text-center text-[var(--color-text-muted)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
              Fetching live jobs…
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discoveredJobs.map((job) => (
              <Card key={job.id} padding="md" className="flex flex-col gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[var(--color-text)] leading-snug">{job.title}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--color-primary-50)] px-2 py-0.5 text-xs text-[var(--color-primary-600)]">
                      {job.source}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{job.company}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{job.location}</p>
                  {job.type && (
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{job.type}</p>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-3">{job.description}</p>
                <div className="mt-auto flex gap-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-700)]"
                  >
                    View job
                  </a>
                  <button
                    onClick={() => saveJob(job)}
                    disabled={savedIds.has(job.id) || savingId === job.id}
                    className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${savedIds.has(job.id)
                        ? "border-green-300 bg-green-50 text-green-700 cursor-default"
                        : "border-[var(--color-border)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-600)]"
                      }`}
                  >
                    {savingId === job.id ? "Saving…" : savedIds.has(job.id) ? "✓ Saved" : "Save"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── MY APPLICATIONS TAB ── */}
      {tab === "saved" && (
        <div className="space-y-4">
          {loadingSaved && (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
              Loading your applications…
            </div>
          )}

          {!loadingSaved && savedJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <p className="text-2xl">📋</p>
              <p className="mt-2 font-medium text-[var(--color-text)]">No saved jobs yet</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Search for jobs and click "Save" to track them here.
              </p>
              <button
                onClick={() => setTab("discover")}
                className="mt-4 text-sm font-medium text-[var(--color-primary-600)] hover:underline"
              >
                Go to Discover →
              </button>
            </div>
          )}

          {savedJobs.map((job) => (
            <Card key={job.id} padding="md">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text)]">{job.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{job.company}</p>
                  {job.location && (
                    <p className="text-xs text-[var(--color-text-muted)]">{job.location}</p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Via {job.source} · Updated {new Date(job.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status selector */}
                  <select
                    value={job.status}
                    disabled={updatingId === job.id}
                    onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-700)]"
                  >
                    View job
                  </a>
                  <button
                    onClick={() => deleteJob(job.id)}
                    title="Remove"
                    className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
