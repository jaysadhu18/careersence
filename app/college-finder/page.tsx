"use client";

import { useState, useCallback } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { CollegeCard } from "@/components/domain/CollegeCard";
import type { College } from "@/lib/hooks/useCollegeSearch";

const stateOptions = [
  { value: "", label: "Select State" },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
  { value: "Andaman & Nicobar Islands", label: "Andaman & Nicobar Islands" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Dadra & Nagar Haveli and Daman & Diu", label: "Dadra & Nagar Haveli and Daman & Diu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Jammu & Kashmir", label: "Jammu & Kashmir" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Puducherry", label: "Puducherry" },
];

const fieldOptions = [
  { value: "", label: "Select Field" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Electronics & Communication", label: "Electronics & Communication" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Chemical Engineering", label: "Chemical Engineering" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "Commerce & Accounting", label: "Commerce & Accounting" },
  { value: "Economics", label: "Economics" },
  { value: "Medicine (MBBS)", label: "Medicine (MBBS)" },
  { value: "Pharmacy", label: "Pharmacy" },
  { value: "Nursing", label: "Nursing" },
  { value: "Dental", label: "Dental" },
  { value: "Law", label: "Law" },
  { value: "Architecture", label: "Architecture" },
  { value: "Design", label: "Design" },
  { value: "Arts & Humanities", label: "Arts & Humanities" },
  { value: "Science (Physics/Chemistry/Maths)", label: "Science (Physics/Chemistry/Maths)" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Education & Teaching", label: "Education & Teaching" },
  { value: "Hotel Management", label: "Hotel Management" },
  { value: "Mass Communication & Journalism", label: "Mass Communication & Journalism" },
  { value: "Data Science & AI", label: "Data Science & AI" },
];

const degreeOptions = [
  { value: "", label: "Select Degree" },
  { value: "Bachelor's", label: "Bachelor's" },
  { value: "Master's", label: "Master's" },
  { value: "Diploma", label: "Diploma" },
  { value: "PhD", label: "PhD" },
  { value: "Certificate", label: "Certificate" },
];

export default function CollegeFinderPage() {
  const [state, setState] = useState("");
  const [field, setField] = useState("");
  const [degreeType, setDegreeType] = useState("");

  const [colleges, setColleges] = useState<College[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const addToShortlist = (id: string) => {
    setShortlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeFromShortlist = (id: string) => {
    setShortlist((prev) => prev.filter((x) => x !== id));
  };

  const shortlistedColleges = colleges.filter((c) => shortlist.includes(c.id));

  const handleSearch = useCallback(async () => {
    if (!state || !field || !degreeType) {
      setError("Please select a state, field of study, and degree type.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch("/api/college-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, field, degreeType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to search colleges.");
        setColleges([]);
        return;
      }

      setColleges(data.colleges || []);
      setHasMore((data.colleges || []).length >= 8);
    } catch {
      setError("Something went wrong. Please try again.");
      setColleges([]);
    } finally {
      setLoading(false);
    }
  }, [state, field, degreeType]);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    setError("");

    try {
      const excludeNames = colleges.map((c) => c.name);
      const res = await fetch("/api/college-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, field, degreeType, exclude: excludeNames }),
      });

      const data = await res.json();

      if (!res.ok) {
        setHasMore(false);
        return;
      }

      const newColleges = data.colleges || [];
      if (newColleges.length === 0) {
        setHasMore(false);
      } else {
        setColleges((prev) => [...prev, ...newColleges]);
        setHasMore(newColleges.length >= 5);
      }
    } catch {
      setError("Failed to load more colleges.");
    } finally {
      setLoadingMore(false);
    }
  }, [state, field, degreeType, colleges]);

  return (
    <PageShell
      title="College Finder"
      description="Discover and compare colleges or programs aligned with your interests."
      maxWidth="xl"
    >
      <Card padding="md" className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Search colleges
        </h2>
        <div className="flex flex-wrap gap-4">
          <Select
            label="State"
            options={stateOptions}
            value={state}
            onChange={(e) => setState(e.target.value)}
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
            <Button variant="primary" onClick={handleSearch} loading={loading}>
              Search
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 rounded-lg border border-[var(--color-error)] bg-red-50 p-3 text-sm text-red-800" role="alert">
            {error}
          </div>
        )}
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Results
            {colleges.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                ({colleges.length} colleges found)
              </span>
            )}
          </h2>

          {loading && (
            <Card padding="lg">
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
                <p className="text-sm text-[var(--color-text-muted)]">
                  Searching colleges in {state} for {degreeType} in {field}...
                </p>
              </div>
            </Card>
          )}

          {!loading && !searched && (
            <Card padding="lg">
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                Select a state, field of study, and degree type, then click Search to find colleges.
              </p>
            </Card>
          )}

          {!loading && searched && colleges.length === 0 && !error && (
            <Card padding="lg">
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                No colleges found for this combination. Try different filters.
              </p>
            </Card>
          )}

          {!loading && colleges.length > 0 && (
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
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} loading={loadingMore}>
                  Load more colleges
                </Button>
              </div>
            )}
          </div>
          )}
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
