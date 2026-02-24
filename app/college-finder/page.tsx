"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { CollegeCard } from "@/components/domain/CollegeCard";
import { useCollegeSearch } from "@/lib/hooks/useCollegeSearch";

const countryOptions = [
  { value: "", label: "Any" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "eu", label: "Europe" },
];

const fieldOptions = [
  { value: "", label: "Any field" },
  { value: "computer", label: "Computer Science" },
  { value: "business", label: "Business" },
  { value: "design", label: "Design" },
];

const degreeOptions = [
  { value: "", label: "Any" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "certificate", label: "Certificate" },
];

export default function CollegeFinderPage() {
  const [field, setField] = useState("");
  const [degreeType, setDegreeType] = useState("");
  const {
    colleges,
    shortlistedColleges,
    addToShortlist,
    removeFromShortlist,
    shortlist,
  } = useCollegeSearch({ field, degreeType });

  return (
    <PageShell
      title="College Finder"
      description="Discover and compare colleges or programs aligned with your interests."
      maxWidth="xl"
    >
      <Card padding="md" className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Refine your search
        </h2>
        <div className="flex flex-wrap gap-4">
          <Select
            label="Country / region"
            options={countryOptions}
            value=""
            onChange={() => {}}
          />
          <Select
            label="Field of study"
            options={fieldOptions}
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
          <Select
            label="Degree type"
            options={degreeOptions}
            value={degreeType}
            onChange={(e) => setDegreeType(e.target.value)}
          />
          <div className="flex items-end">
            <Button variant="primary">Search</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Results
          </h2>
          <div className="space-y-4">
            {colleges.map((c) => (
              <CollegeCard
                key={c.id}
                college={c}
                onSave={() => addToShortlist(c.id)}
                onRemove={() => removeFromShortlist(c.id)}
                isShortlisted={shortlist.includes(c.id)}
              />
            ))}
          </div>
        </div>
        <div>
          <Card padding="md" className="sticky top-24">
            <h3 className="font-semibold text-[var(--color-text)]">
              Your shortlist
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Save colleges to compare key metrics side by side.
            </p>
            {shortlistedColleges.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                No colleges in shortlist yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {shortlistedColleges.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-2 text-sm"
                  >
                    <span className="font-medium">{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFromShortlist(c.id)}
                      className="text-[var(--color-error)] hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {shortlistedColleges.length >= 2 && (
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Compare selected
              </Button>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
