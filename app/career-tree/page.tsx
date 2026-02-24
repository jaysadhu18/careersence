import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export default function CareerTreePage() {
  return (
    <PageShell
      title="Career Tree"
      description="Explore how roles and industries connect. See possible paths from one career to another."
      maxWidth="xl"
    >
      <Card padding="lg" className="text-center">
        <p className="text-[var(--color-text-muted)]">
          The Career Tree view is coming soon. You’ll be able to explore career
          clusters, see required skills and education, and discover adjacent
          roles.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/career-quiz"
            className="rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
          >
            Take the career quiz
          </Link>
          <Link
            href="/ai-roadmap"
            className="rounded-lg border-2 border-[var(--color-primary-600)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
          >
            View your roadmap
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
