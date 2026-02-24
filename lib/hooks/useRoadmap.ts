"use client";

import { useState, useCallback } from "react";
import { roadmapStages } from "@/lib/mock-data";

export type StageStatus = "not_started" | "in_progress" | "completed";

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  timeRange: string;
  status: StageStatus;
  actions: string[];
  resourceIds: string[];
}

export function useRoadmap() {
  const [stages, setStages] = useState<RoadmapStage[]>(roadmapStages);

  const setStageStatus = useCallback((stageId: string, status: StageStatus) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, status } : s))
    );
  }, []);

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const totalActions = stages.reduce((acc, s) => acc + s.actions.length, 0);
  const completedActions = 4; // mock
  const progressPct = totalActions ? Math.round((completedActions / totalActions) * 100) : 0;

  return { stages, setStageStatus, progressPct, completedCount, total: stages.length };
}
