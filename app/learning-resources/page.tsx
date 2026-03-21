"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ResourceCard } from "@/components/domain/ResourceCard";
import { useResources } from "@/lib/hooks/useResources";
import type { ResourceType, Level } from "@/lib/hooks/useResources";

const typeOptions = [
  { value: "", label: "All types" },
  { value: "course", label: "Course" },
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "bootcamp", label: "Bootcamp" },
];

const levelOptions = [
  { value: "", label: "All levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "shortest", label: "Shortest time" },
];

export default function LearningResourcesPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState<ResourceType | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [sort, setSort] = useState("relevance");

  const [apiResources, setApiResources] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Auto-search if redirected with ?q
  useEffect(() => {
    const q = searchParams.get("q");
    if (q?.trim()) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    savedIds,
    toggleSave,
  } = useResources();

  async function handleSearch() {
    if (!searchInput.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const url = "/api/courses/search?q=" + encodeURIComponent(searchInput) + (session?.user?.id ? "&excludeUserId=" + session.user.id : "");
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApiResources(data.courses || []);
      }
    } catch (err) {
      console.error("API Search formatting failed.", err);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (!searchInput.trim()) {
      setHasSearched(false);
      setApiResources([]);
    }
  }, [searchInput]);

  const displayedResources = useMemo(() => {
    if (!hasSearched) return [];
    let result = apiResources;
    if (type) result = result.filter((r) => r.type === type);
    if (level) result = result.filter((r) => r.level === level || r.level === "All Levels");
    return result;
  }, [hasSearched, apiResources, type, level]);

  return (
    <PageShell
      title="Learning Resources"
      description="Courses, articles, and videos to build skills for your chosen path. Filter by type and level."
      maxWidth="xl"
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/learning-resources/instructor"
            className="inline-flex h-[36px] items-center justify-center rounded-lg border border-[var(--color-primary-400)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-primary-600)] shadow-sm transition-colors hover:bg-[var(--color-primary-50)]"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Instructor Dashboard
          </Link>
        </div>
      }
    >
      <Card padding="md" className="mb-8">
        <div className="flex flex-col gap-4">
          {/* Line 1: Search, Type */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
            <div className="w-full sm:w-1/2">
              <Input
                label="Search"
                placeholder="Search by title or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <Select
                label="Type"
                options={typeOptions}
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType | "")}
              />
            </div>
          </div>

          {/* Line 2: Level, Sort */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
            <div className="w-full sm:w-1/2">
              <Select
                label="Level"
                options={levelOptions}
                value={level}
                onChange={(e) => setLevel(e.target.value as Level | "")}
              />
            </div>
            <div className="w-full sm:w-1/2">
              <Select
                label="Sort"
                options={sortOptions}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              />
            </div>
          </div>

          {/* Line 3: Search Action Button */}
          <div className="flex sm:justify-start w-full">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex h-[44px] w-full sm:w-auto min-w-[160px] items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-6 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-800)] disabled:opacity-60"
            >
              {isSearching ? "Searching..." : "Search Resources"}
            </button>
          </div>
        </div>
      </Card>

      {!hasSearched ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-16 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary-500)]/10">
            <svg className="h-8 w-8 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--color-text)]">Find Your Learning Resources</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">
              Search for any skill, technology, or topic to get curated videos, articles, and courses from YouTube and the web.
            </p>
          </div>

          {/* How to use steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mt-2">
            {[
              { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", label: "Type a skill", desc: "e.g. React, Python, UI Design" },
              { icon: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z", label: "Filter results", desc: "By type, level, or source" },
              { icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", label: "Save resources", desc: "Bookmark for later access" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-500)]/10">
                  <svg className="h-5 w-5 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={s.icon} />
                  </svg>
                </div>
                <p className="text-xs font-bold text-[var(--color-text)]">{s.label}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : hasSearched && displayedResources.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-medium text-[var(--color-text)]">No resources match your filters.</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Try broadening your search or changing filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedResources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              onSave={() => toggleSave(r)}
              isSaved={savedIds.has(r.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
