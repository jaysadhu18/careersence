import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "registration"
  | "roadmap"
  | "quiz"
  | "career_tree"
  | "resume_analysis"
  | "saved_job";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  label: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  detail: string;
  createdAt: string;
}

const PAGE_SIZE = 30;

/**
 * GET /api/admin/activity
 * Query params:
 *   page      – page number (default 1)
 *   type      – filter by ActivityType (default "all")
 *   userId    – filter to a single user (optional)
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const typeFilter = searchParams.get("type") ?? "all";
  const userIdFilter = searchParams.get("userId") ?? "";
  const skip = (page - 1) * PAGE_SIZE;

  const userWhere = userIdFilter ? { userId: userIdFilter } : {};

  // Fetch from all tables (limited) in parallel
  const [users, roadmaps, quizzes, careerTrees, resumeAnalyses, savedJobs] =
    await Promise.all([
      typeFilter === "all" || typeFilter === "registration"
        ? prisma.user.findMany({
            where: userIdFilter ? { id: userIdFilter } : {},
            orderBy: { createdAt: "desc" },
            take: 200,
            select: { id: true, name: true, email: true, createdAt: true },
          })
        : Promise.resolve([]),

      typeFilter === "all" || typeFilter === "roadmap"
        ? prisma.roadmap.findMany({
            where: userWhere,
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
              id: true,
              careerGoal: true,
              createdAt: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),

      typeFilter === "all" || typeFilter === "quiz"
        ? prisma.quizSession.findMany({
            where: userWhere,
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
              id: true,
              createdAt: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),

      typeFilter === "all" || typeFilter === "career_tree"
        ? prisma.careerTree.findMany({
            where: userWhere,
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
              id: true,
              rootTitle: true,
              createdAt: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),

      typeFilter === "all" || typeFilter === "resume_analysis"
        ? prisma.resumeAnalysis.findMany({
            where: userWhere,
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
              id: true,
              fileName: true,
              overallScore: true,
              createdAt: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),

      typeFilter === "all" || typeFilter === "saved_job"
        ? prisma.savedJob.findMany({
            where: userWhere,
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
              id: true,
              title: true,
              company: true,
              status: true,
              createdAt: true,
              userId: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),
    ]);

  // Normalize into unified ActivityItem[]
  const feed: ActivityItem[] = [
    ...users.map((u) => ({
      id: `reg-${u.id}`,
      type: "registration" as ActivityType,
      label: "New Registration",
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      detail: `Account created`,
      createdAt: u.createdAt.toISOString(),
    })),

    ...roadmaps.map((r) => ({
      id: `roadmap-${r.id}`,
      type: "roadmap" as ActivityType,
      label: "Roadmap Generated",
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      detail: `Goal: ${r.careerGoal}`,
      createdAt: r.createdAt.toISOString(),
    })),

    ...quizzes.map((q) => ({
      id: `quiz-${q.id}`,
      type: "quiz" as ActivityType,
      label: "Career Quiz",
      userId: q.userId,
      userName: q.user.name,
      userEmail: q.user.email,
      detail: `Quiz session completed`,
      createdAt: q.createdAt.toISOString(),
    })),

    ...careerTrees.map((c) => ({
      id: `tree-${c.id}`,
      type: "career_tree" as ActivityType,
      label: "Career Tree",
      userId: c.userId,
      userName: c.user.name,
      userEmail: c.user.email,
      detail: `Root: ${c.rootTitle}`,
      createdAt: c.createdAt.toISOString(),
    })),

    ...resumeAnalyses.map((a) => ({
      id: `resume-${a.id}`,
      type: "resume_analysis" as ActivityType,
      label: "Resume Analyzed",
      userId: a.userId,
      userName: a.user.name,
      userEmail: a.user.email,
      detail: `${a.fileName} — Score: ${a.overallScore}/100`,
      createdAt: a.createdAt.toISOString(),
    })),

    ...savedJobs.map((j) => ({
      id: `job-${j.id}`,
      type: "saved_job" as ActivityType,
      label: "Job Saved",
      userId: j.userId,
      userName: j.user.name,
      userEmail: j.user.email,
      detail: `${j.title} @ ${j.company} [${j.status}]`,
      createdAt: j.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = feed.length;
  const paginated = feed.slice(skip, skip + PAGE_SIZE);

  return NextResponse.json({
    items: paginated,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
