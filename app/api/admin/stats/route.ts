import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    total,
    disabled,
    newThisMonth,
    totalRoadmaps,
    totalQuizzes,
    totalCareerTrees,
    totalResumeAnalyses,
    totalSavedJobs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { disabled: true } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.roadmap.count(),
    prisma.quizSession.count(),
    prisma.careerTree.count(),
    prisma.resumeAnalysis.count(),
    prisma.savedJob.count(),
  ]);

  return NextResponse.json({
    total,
    active: total - disabled,
    disabled,
    newThisMonth,
    totalRoadmaps,
    totalQuizzes,
    totalCareerTrees,
    totalResumeAnalyses,
    totalSavedJobs,
  });
}
