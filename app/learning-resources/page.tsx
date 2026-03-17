"use client";

import { useState, useMemo, useEffect } from "react";
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
  const [searchInput, setSearchInput] = useState("");
  const [type, setType] = useState<ResourceType | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [sort, setSort] = useState("relevance");

  const [apiResources, setApiResources] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    resources,
    savedIds,
    toggleSave,
  } = useResources({
    query: searchInput || undefined,
    type: type || undefined,
    level: level === "" ? undefined : level,
  });

  async function handleSearch() {
    if (!searchInput.trim()) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/courses/search?q=${encodeURIComponent(searchInput)}`);
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
    let result = hasSearched ? apiResources : resources;

    if (hasSearched) {
      if (type) {
        result = result.filter((r) => r.type === type);
      }
      if (level) {
        // Assume API results might be "All Levels" or undefined, so don't completely hide them unless there's a strict level set.
        result = result.filter((r) => r.level === level || r.level === "All Levels");
      }
    }

    return result;
  }, [hasSearched, apiResources, resources, type, level]);

  return (
    <PageShell
      title="Learning Resources"
      description="Courses, articles, and videos to build skills for your chosen path. Filter by type and level."
      maxWidth="xl"
      action={
        <Link
          href="/learning-resources/provider"
          className="inline-flex h-[36px] items-center justify-center rounded-lg bg-[var(--color-primary-100)] px-4 text-sm font-semibold text-[var(--color-primary-700)] shadow-sm transition-colors hover:bg-[var(--color-primary-200)] hover:text-[var(--color-primary-800)]"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Resource Registration
        </Link>
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

      {displayedResources.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <p className="font-medium text-[var(--color-text)]">
            No resources match your filters.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Try broadening your search or changing filters.
          </p>
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
