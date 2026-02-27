import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { College } from "@/lib/hooks/useCollegeSearch";

interface CollegeCardProps {
  college: College;
  onSave?: () => void;
  onRemove?: () => void;
  isShortlisted?: boolean;
}

export function CollegeCard({
  college,
  onSave,
  onRemove,
  isShortlisted,
}: CollegeCardProps) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <h3 className="font-semibold text-[var(--color-text)]">{college.name}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{college.location}</p>
      <p className="text-sm font-medium text-[var(--color-text)]">{college.degree}</p>
      <div className="flex flex-wrap gap-2 text-sm text-[var(--color-text-muted)]">
        <span>{college.costRange}</span>
        <span>·</span>
        <span>Admission {college.admissionRate}</span>
      </div>
      {(college.stateRanking || college.countryRanking || college.worldRanking) && (
        <div className="flex flex-wrap gap-3">
          {college.stateRanking && college.stateRanking !== "Not ranked" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary-50)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-700)]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11" /></svg>
              {college.stateRanking}
            </span>
          )}
          {college.countryRanking && college.countryRanking !== "Not ranked" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
              {college.countryRanking}
            </span>
          )}
          {college.worldRanking && college.worldRanking !== "Not ranked" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              {college.worldRanking}
            </span>
          )}
        </div>
      )}
      <ul className="list-inside list-disc text-sm text-[var(--color-text-muted)]">
        {college.strengths.slice(0, 3).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      <div className="mt-auto flex gap-2">
        <Button variant="outline" size="sm">
          View details
        </Button>
        {isShortlisted ? (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove from shortlist
          </Button>
        ) : (
          onSave && (
            <Button variant="primary" size="sm" onClick={onSave}>
              Save to shortlist
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
