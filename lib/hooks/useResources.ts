"use client";

import { useState, useMemo, useEffect } from "react";
import { learningResources } from "@/lib/mock-data";

export type ResourceType = "course" | "article" | "video" | "bootcamp";
export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  description: string;
  durationMinutes: number;
  level: Level;
  source: string;
  url: string;
}

export function useResources(filters?: {
  query?: string;
  type?: ResourceType;
  level?: Level;
}) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list: Resource[] = [...learningResources];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    if (filters?.type) list = list.filter((r) => r.type === filters.type);
    if (filters?.level) list = list.filter((r) => r.level === filters.level);
    return list;
  }, [filters?.query, filters?.type, filters?.level]);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch("/api/learning/saved");
        if (res.ok) {
          const data = await res.json();
          const ids = data.resources?.map((r: any) => r.resourceId) || [];
          setSavedIds(new Set(ids));
        }
      } catch (err) {
        console.error("Failed to fetch saved resources");
      }
    }
    fetchSaved();
  }, []);

  const toggleSave = async (resource: Resource) => {
    const isSaved = savedIds.has(resource.id);

    // Optimistic UI update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(resource.id);
      else next.add(resource.id);
      return next;
    });

    try {
      if (isSaved) {
        // Unsave
        await fetch(`/api/learning/saved?resourceId=${encodeURIComponent(resource.id)}`, {
          method: "DELETE",
        });
      } else {
        // Save
        await fetch("/api/learning/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceId: resource.id,
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
            source: resource.source,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to toggle save resource", err);
      // Revert optimistic update on failure
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(resource.id);
        else next.delete(resource.id);
        return next;
      });
    }
  };

  return {
    resources: filtered,
    savedIds,
    toggleSave,
  };
}
