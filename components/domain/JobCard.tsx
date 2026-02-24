import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/hooks/useJobs";

interface JobCardProps {
  job: Job;
  onStatusChange?: (status: JobStatus) => void;
}

const statusVariant: Record<JobStatus, "default" | "primary" | "secondary" | "success" | "error"> = {
  saved: "default",
  applied: "primary",
  interviewing: "secondary",
  offer: "success",
  rejected: "error",
};

export function JobCard({ job, onStatusChange }: JobCardProps) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--color-text)]">{job.title}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">{job.company}</p>
        </div>
        <Badge variant={statusVariant[job.status]} size="sm">
          {job.status}
        </Badge>
      </div>
      <p className="text-sm text-[var(--color-text-muted)]">{job.location}</p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Updated {formatDate(job.updatedAt)}
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
        >
          View job
        </Link>
        {onStatusChange && (
          <select
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
            value={job.status}
            onChange={(e) => onStatusChange(e.target.value as JobStatus)}
            aria-label="Update status"
          >
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>
    </Card>
  );
}
