"use client";

import { useState } from "react";
import { savedJobs } from "@/lib/mock-data";

export type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: JobStatus;
  updatedAt: string;
  url: string;
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(savedJobs);

  const updateStatus = (id: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id ? { ...j, status, updatedAt: new Date().toISOString().slice(0, 10) } : j
      )
    );
  };

  const stats = {
    saved: jobs.filter((j) => j.status === "saved").length,
    applied: jobs.filter((j) => j.status === "applied").length,
    interviewing: jobs.filter((j) => j.status === "interviewing").length,
    offer: jobs.filter((j) => j.status === "offer").length,
  };

  return { jobs, updateStatus, stats };
}
