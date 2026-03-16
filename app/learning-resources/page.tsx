"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
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

  const displayedResources = hasSearched ? apiResources : resources;

  return (
    <PageShell
      title="Learning Resources"
      description="Courses, articles, and videos to build skills for your chosen path. Filter by type and level."
      maxWidth="xl"
    >
      <div className="mb-8 flex flex-col gap-4">
        {/* Line 1: Search, Search Button, Type */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
          <div className="flex flex-1 items-end gap-2">
            <div className="flex-1">
              <Input
                label="Search"
                placeholder="Search by title or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex h-[42px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-background)] active:bg-[var(--color-border)] disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
          <div className="w-full sm:w-1/3">
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
      </div>

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
              onSave={() => toggleSave(r.id)}
              isSaved={savedIds.has(r.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
