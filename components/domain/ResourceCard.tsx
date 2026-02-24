import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDuration } from "@/lib/utils";
import type { Resource } from "@/lib/hooks/useResources";

interface ResourceCardProps {
  resource: Resource;
  onSave?: () => void;
  isSaved?: boolean;
}

export function ResourceCard({ resource, onSave, isSaved }: ResourceCardProps) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge variant="primary" size="sm">
          {resource.type}
        </Badge>
        <Badge variant="outline" size="sm">
          {resource.level}
        </Badge>
      </div>
      <h3 className="font-semibold text-[var(--color-text)]">{resource.title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
        {resource.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
        <span>{formatDuration(resource.durationMinutes)}</span>
        <span>{resource.source}</span>
      </div>
      <div className="flex gap-2">
        <Link
          href={resource.url}
          className="flex flex-1 items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
        >
          View resource
        </Link>
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            aria-pressed={isSaved}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
        )}
      </div>
    </Card>
  );
}
