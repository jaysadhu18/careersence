"use client";

import { useState, useMemo } from "react";
import { colleges } from "@/lib/mock-data";

export interface College {
  id: string;
  name: string;
  location: string;
  degree: string;
  costRange: string;
  admissionRate: string;
  strengths: string[];
}

export function useCollegeSearch(filters?: {
  country?: string;
  field?: string;
  degreeType?: string;
}) {
  const [shortlist, setShortlist] = useState<string[]>([]);

  const results = useMemo(() => {
    let list: College[] = [...colleges];
    if (filters?.field) {
      list = list.filter(
        (c) =>
          c.degree.toLowerCase().includes(filters.field!.toLowerCase())
      );
    }
    if (filters?.degreeType) {
      list = list.filter((c) =>
        c.degree.toLowerCase().includes(filters.degreeType!.toLowerCase())
      );
    }
    return list;
  }, [filters?.field, filters?.degreeType]);

  const addToShortlist = (id: string) => {
    setShortlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFromShortlist = (id: string) => {
    setShortlist((prev) => prev.filter((x) => x !== id));
  };

  const shortlistedColleges = results.filter((c) => shortlist.includes(c.id));

  return {
    colleges: results,
    shortlist,
    shortlistedColleges,
    addToShortlist,
    removeFromShortlist,
  };
}
