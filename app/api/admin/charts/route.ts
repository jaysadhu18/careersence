import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ActivityType =
  | "registration"
  | "roadmap"
  | "quiz"
  | "career_tree"
  | "resume_analysis"
  | "saved_job";

const TYPE_LABELS: Record<ActivityType, string> = {
  registration: "Registrations",
  roadmap: "Roadmaps",
  quiz: "Career Quiz",
  career_tree: "Career Tree",
  resume_analysis: "Resume Analysis",
  saved_job: "Saved Jobs",
};

function getDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getStartDate(days: number) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));
  return startDate;
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const requestedDays = Number.parseInt(req.nextUrl.searchParams.get("days") ?? "14", 10);
  const days = Number.isFinite(requestedDays)
    ? Math.min(Math.max(requestedDays, 7), 30)
    : 14;

  const startDate = getStartDate(days);

  const [
    registrationCount,
    roadmapCount,
    quizCount,
    careerTreeCount,
    resumeAnalysisCount,
    savedJobCount,
    registrations,
    roadmaps,
    quizzes,
    careerTrees,
    resumeAnalyses,
    savedJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.roadmap.count(),
    prisma.quizSession.count(),
    prisma.careerTree.count(),
    prisma.resumeAnalysis.count(),
    prisma.savedJob.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.roadmap.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.quizSession.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.careerTree.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.resumeAnalysis.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
    prisma.savedJob.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
  ]);

  const activityByType = [
    { type: "registration" as const, label: TYPE_LABELS.registration, count: registrationCount },
    { type: "roadmap" as const, label: TYPE_LABELS.roadmap, count: roadmapCount },
    { type: "quiz" as const, label: TYPE_LABELS.quiz, count: quizCount },
    { type: "career_tree" as const, label: TYPE_LABELS.career_tree, count: careerTreeCount },
    { type: "resume_analysis" as const, label: TYPE_LABELS.resume_analysis, count: resumeAnalysisCount },
    { type: "saved_job" as const, label: TYPE_LABELS.saved_job, count: savedJobCount },
  ].sort((left, right) => right.count - left.count);

  const activityTrend = Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      date: getDateKey(date),
      count: 0,
    };
  });

  const trendIndexByDate = new Map(
    activityTrend.map((bucket, index) => [bucket.date, index]),
  );

  const recentActivity = [
    ...registrations,
    ...roadmaps,
    ...quizzes,
    ...careerTrees,
    ...resumeAnalyses,
    ...savedJobs,
  ];

  for (const entry of recentActivity) {
    const index = trendIndexByDate.get(getDateKey(entry.createdAt));
    if (index !== undefined) {
      activityTrend[index].count += 1;
    }
  }

  return NextResponse.json({
    days,
    totalActivities: activityByType.reduce((sum, item) => sum + item.count, 0),
    activityByType,
    activityTrend,
  });
}
