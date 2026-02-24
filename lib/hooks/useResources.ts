"use client";

import { useState, useMemo } from "react";
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

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return {
    resources: filtered,
    savedIds,
    toggleSave,
  };
}
