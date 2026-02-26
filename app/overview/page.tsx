import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { OverviewSidebar } from "@/components/layout/OverviewSidebar";
import { Card, CardHeader } from "@/components/ui/Card";
import { RoadmapHistorySection } from "@/components/domain/RoadmapHistorySection";
import { QuizHistorySection } from "@/components/domain/QuizHistorySection";
import { prisma } from "@/lib/prisma";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const user = session.user;

  // Fetch job stats from DB
  let appliedJobs = 0, interviewingJobs = 0, totalSavedJobs = 0;
  try {
    if (user?.id) {
      const jobs = await prisma.savedJob.findMany({ where: { userId: user.id }, select: { status: true } });
      totalSavedJobs = jobs.length;
      appliedJobs = jobs.filter((j: { status: string }) => j.status === "applied").length;
      interviewingJobs = jobs.filter((j: { status: string }) => j.status === "interviewing").length;
    }
  } catch { /* ignore */ }




  // Fetch previous roadmaps from DB (guarded in case Prisma client is stale)
  let previousRoadmaps: { id: string; careerGoal: string; stages: string; createdAt: string }[] = [];
  try {
    if (user?.id) {
      const rows = await prisma.roadmap.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, careerGoal: true, stages: true, createdAt: true },
      });
      previousRoadmaps = rows.map((r: { id: string; careerGoal: string; stages: string; createdAt: Date }) => ({ ...r, createdAt: r.createdAt.toISOString() }));
    }
  } catch {
    previousRoadmaps = [];
  }

  // Fetch quiz sessions from DB
  let quizSessions: { id: string; phase1Answers: string; results: string | null; createdAt: string }[] = [];
  try {
    if (user?.id) {
      const rows = await prisma.quizSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, phase1Answers: true, results: true, createdAt: true },
      });
      quizSessions = rows.map((r: { id: string; phase1Answers: string; results: string | null; createdAt: Date }) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch {
    quizSessions = [];
  }

  return (
    <PageShell
      title="Your career overview"
      description="Here's where you stand and what to do next."
      sidebar={<OverviewSidebar />}
      maxWidth="xl"
    >
      <div className="space-y-8">

        {/* Job Hunting - full width rectangle */}
        <Card padding="md" className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Job hunting</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Saved roles and applications.</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--color-text-muted)]">
                <span>Saved: <strong>{totalSavedJobs}</strong></span>
                <span>Applied: <strong>{appliedJobs}</strong></span>
                <span>Interviewing: <strong>{interviewingJobs}</strong></span>
              </div>
            </div>
            <Link
              href="/job-hunting"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
            >
              Manage jobs
            </Link>
          </div>
        </Card>

        {/* Previous AI Roadmaps */}
        <section className="space-y-4">
          <CardHeader
            title="Previous Roadmaps"
            description="Your AI-generated roadmaps, saved for reference."
            action={
              <Link
                href="/ai-roadmap"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
              >
                + Generate new
              </Link>
            }
          />
          <RoadmapHistorySection roadmaps={previousRoadmaps} />
        </section>

        {/* Career Quiz History */}
        <section className="space-y-4">
          <CardHeader
            title="Career Quiz History"
            description="Your AI-powered career assessment results."
            action={
              <Link
                href="/career-quiz"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
              >
                + Take quiz
              </Link>
            }
          />
          <QuizHistorySection quizzes={quizSessions} />
        </section>


      </div>
    </PageShell>
  );
}
