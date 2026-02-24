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
