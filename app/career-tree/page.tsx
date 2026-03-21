"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  Node,
  Edge,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Milestone {
  title: string;
  timeframe: string;
  skills: string[];
  actions: string[];
}

interface CareerBranch {
  id: string;
  title: string;
  color: string;
  description: string;
  shortTermAlignment: string;
  longTermAlignment: string;
  milestones: Milestone[];
}

interface CareerTreeData {
  root: { title: string; description: string; skills: string[] };
  branches: CareerBranch[];
}

interface FormData {
  skills: string;
  passions: string;
  targetRoles: string;
  currentStage: string;
  shortTermGoal: string;
  longTermGoal: string;
}

const initialForm: FormData = {
  skills: "",
  passions: "",
  targetRoles: "",
  currentStage: "",
  shortTermGoal: "",
  longTermGoal: "",
};

const STAGES = [
  "High School Student",
  "Undergraduate Student",
  "Graduate Student",
  "Recent Graduate",
  "Early Career (1–2 years)",
  "Career Switcher",
  "Self-learning",
];

type View = "form" | "loading" | "tree";

// ─── Custom Nodes ────────────────────────────────────────────────────────────

const RootNode = ({ data }: { data: { title: string; description: string; skills: string[] } }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="node-root group">
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <div className="relative z-10 flex flex-col items-center">
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-500 ${isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary-200)]"
          }`}>
          <svg className={`h-9 w-9 ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-[var(--color-primary-500)]"
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className={`text-xl font-black tracking-tight uppercase ${isDark ? "text-white" : "text-gray-800"}`}>{data.title}</h3>
        <p className={`mt-3 text-[10px] leading-relaxed font-bold uppercase tracking-widest ${isDark ? "text-white/70" : "text-gray-500"}`}>
          Starting Point
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {data.skills.map((s, i) => (
            <span key={i} className={`rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest backdrop-blur-md ${isDark
              ? "border-white/10 bg-white/10 text-white/90"
              : "border-black/10 bg-black/5 text-gray-700"
              }`}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MilestoneNode = ({ data }: { data: Milestone & { color: string; onShowDetails: (m: Milestone) => void } }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="node-milestone group cursor-pointer"
      style={{ borderColor: `${data.color}40` }}
      onClick={() => data.onShowDetails(data)}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />

      <div className="flex flex-col items-center">
        <div
          className="node-milestone-time"
          style={{ color: data.color, background: `${data.color}15`, border: `1px solid ${data.color}30` }}
        >
          {data.timeframe}
        </div>
        <div className={`node-milestone-header text-center transition-colors ${isDark ? "group-hover:text-white" : "group-hover:text-[var(--color-primary-600)]"
          }`}>
          {data.title}
        </div>

        <div className="mt-3 flex flex-wrap gap-1 justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          {data.skills.slice(0, 2).map((s, i) => (
            <span key={i} className="node-milestone-badge">
              {s}
            </span>
          ))}
          {data.skills.length > 2 && (
            <span className="node-milestone-badge">+{data.skills.length - 2}</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-primary-400)] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          View Details
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  root: RootNode,
  milestone: MilestoneNode,
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i + 1 < step
              ? "bg-[var(--color-primary-600)] text-white shadow-md"
              : i + 1 === step
                ? "bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white shadow-lg scale-110"
                : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
          >
            {i + 1 < step ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-10 rounded-full transition-all duration-500 ${i + 1 < step
                ? "bg-[var(--color-primary-600)]"
                : "bg-[var(--color-border)]"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CareerTreePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [milestoneResources, setMilestoneResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  // Restore saved tree on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("career-tree-data");
      if (saved) {
        generateNodesAndEdges(JSON.parse(saved));
        setView("tree");
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSteps = 3;

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canProceed = () => {
    if (step === 1) return form.skills.trim() && form.passions.trim();
    if (step === 2) return form.currentStage.trim();
    if (step === 3) return form.shortTermGoal.trim() && form.longTermGoal.trim();
    return false;
  };

  const handleNext = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const onShowDetails = useCallback((m: Milestone) => {
    setSelectedMilestone(m);
    setMilestoneResources([]);
    if (m.skills.length === 0) return;
    setResourcesLoading(true);
    const query = m.skills.slice(0, 3).join(" ");
    fetch(`/api/courses/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => setMilestoneResources((d.courses || []).slice(0, 2)))
      .catch(() => {})
      .finally(() => setResourcesLoading(false));
  }, []);

  const generateNodesAndEdges = (treeData: CareerTreeData) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Root Node
    newNodes.push({
      id: "root",
      type: "root",
      position: { x: 500, y: 50 },
      data: treeData.root,
    });

    const branchSpacing = 600;
    const verticalSpacing = 350;
    const startX = 500 - ((treeData.branches.length - 1) * branchSpacing) / 2;

    treeData.branches.forEach((branch, bIdx) => {
      const branchX = startX + bIdx * branchSpacing;

      branch.milestones.forEach((milestone, mIdx) => {
        const nodeId = `${branch.id}-m${mIdx}`;
        newNodes.push({
          id: nodeId,
          type: "milestone",
          position: { x: branchX - 110, y: 450 + mIdx * verticalSpacing },
          data: { ...milestone, color: branch.color, onShowDetails },
        });

        // Edge logic
        if (mIdx === 0) {
          newEdges.push({
            id: `e-root-${nodeId}`,
            source: "root",
            target: nodeId,
            animated: true,
            label: branch.title,
            labelStyle: { fill: branch.color, fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em" },
            labelBgStyle: { fill: isDark ? "#030712" : "#ffffff", fillOpacity: isDark ? 0.85 : 0.92, rx: 6 },
            labelBgPadding: [4, 8],
            style: { stroke: branch.color, strokeWidth: 3, opacity: 0.9 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: branch.color,
            },
          });
        } else {
          const prevNodeId = `${branch.id}-m${mIdx - 1}`;
          newEdges.push({
            id: `e-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            animated: true,
            style: { stroke: branch.color, opacity: 0.4 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: branch.color,
            },
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleGenerate = async () => {
    setError("");
    setView("loading");
    try {
      const res = await fetch("/api/career-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.details || "Failed to generate career tree");
        setView("form");
        return;
      }
      generateNodesAndEdges(data.tree);
      sessionStorage.setItem("career-tree-data", JSON.stringify(data.tree));
      setView("tree");
    } catch {
      setError("Network error. Please try again.");
      setView("form");
    }
  };

  const startOver = () => {
    sessionStorage.removeItem("career-tree-data");
    setView("form");
    setStep(1);
    setForm(initialForm);
    setNodes([]);
    setEdges([]);
    setError("");
    setIsFullscreen(false);
  };

  // ── Step labels
  const stepLabels = ["Skills & Passions", "Your Roles", "Your Goals"];
  const stepIcons = [
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  ];

  // Re-apply edge label bg colours when theme toggles
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (edges.length === 0) return;
    setEdges((prev) =>
      prev.map((edge) =>
        edge.labelBgStyle
          ? { ...edge, labelBgStyle: { ...edge.labelBgStyle, fill: isDark ? "#030712" : "#ffffff", fillOpacity: isDark ? 0.85 : 0.92 } }
          : edge
      )
    );
  }, [isDark]);

  return (
    <PageShell
      title="Career Tree"
      description="Map your professional progression — assess your strengths, explore career paths, and define your goals. We'll generate a personalized interactive career tree."
      maxWidth="xl"
    >
      {/* ── FORM VIEW ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "form" && (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-2xl px-4"
          >
            <Card
              padding="lg"
              className="border-2 border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] shadow-[var(--shadow-lg)]"
            >
              <div className="mb-6 flex items-center gap-4">
                <motion.div
                  key={step}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white shadow-lg"
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stepIcons[step - 1]} />
                  </svg>
                </motion.div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                    Step {step} of {totalSteps}
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">{stepLabels[step - 1]}</h2>
                </div>
              </div>

              <StepIndicator step={step} total={totalSteps} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 rounded-lg border border-[var(--color-error)] bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-300"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === 1 && (
                    <div className="space-y-5">
                      <Textarea
                        label="Your current skills"
                        placeholder="e.g. Python, mathematics, writing, public speaking..."
                        value={form.skills}
                        onChange={set("skills")}
                        rows={3}
                        required
                      />
                      <Textarea
                        label="Your passions & interests"
                        placeholder="e.g. AI/machine learning, helping people, creative design..."
                        value={form.passions}
                        onChange={set("passions")}
                        rows={3}
                        required
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <Textarea
                        label="Roles or industries you've researched"
                        placeholder="e.g. Data Scientist, Software Engineer..."
                        value={form.targetRoles}
                        onChange={set("targetRoles")}
                        rows={3}
                      />
                      <Select
                        label="Your current stage"
                        value={form.currentStage}
                        onChange={set("currentStage")}
                        required
                        options={[
                          { value: "", label: "Select your stage..." },
                          ...STAGES.map((s) => ({ value: s, label: s })),
                        ]}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <Textarea
                        label="Short-term goal (next 6–12 months)"
                        placeholder="e.g. Land a data science internship..."
                        value={form.shortTermGoal}
                        onChange={set("shortTermGoal")}
                        rows={2}
                        required
                      />
                      <Textarea
                        label="Long-term goal (3–5 years from now)"
                        placeholder="e.g. Become a senior ML engineer..."
                        value={form.longTermGoal}
                        onChange={set("longTermGoal")}
                        rows={2}
                        required
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <Button variant="outline" onClick={handleBack}>
                    ← Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < totalSteps ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next step →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={!canProceed()}
                  >
                    Generate My Career Tree
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── LOADING VIEW ──────────────────────────────────────────────────── */}
        {view === "loading" && (
          <motion.div
            key="loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Card padding="lg" className="mx-auto max-w-md text-center bg-transparent border-0 shadow-none">
              <div className="relative mx-auto h-24 w-24 mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-primary-500)]/20" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] shadow-lg shadow-[var(--color-primary-500)]/40">
                  <svg className="h-12 w-12 animate-pulse text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <p className="font-black text-xl text-[var(--color-text)] uppercase tracking-tighter">
                Architecting Your Future
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)] font-medium">
                AI is mapping thousands of possibilities into 3 optimal paths...
              </p>
              <div className="mt-8 flex justify-center gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="h-1.5 w-6 rounded-full bg-[var(--color-primary-500)]/20 overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--color-primary-500)]"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                    />
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── TREE VIEW ─────────────────────────────────────────────────────── */}
        {view === "tree" && (
          <motion.div
            key="tree-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={
              isFullscreen
                ? `fixed inset-0 z-50 ${isDark ? "bg-[#030712]" : "bg-[#f8fafc]"}`
                : `h-[800px] w-full relative rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl ${isDark ? "bg-[#030712]" : "bg-[#f8fafc]"}`
            }
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.1}
              maxZoom={2}
            >
              <Background color={isDark ? "#1f2937" : "#cbd5e1"} size={1.5} gap={24} variant={"dots" as any} />
              <Controls className="!rounded-2xl backdrop-blur-xl" />

              <Panel position="top-right" className="flex gap-2 items-center">
                {/* Maximize / Minimize toggle */}
                <button
                  onClick={() => setIsFullscreen((f) => !f)}
                  title={isFullscreen ? "Exit full screen" : "Full screen"}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border backdrop-blur-xl transition-colors ${isDark
                    ? "bg-black/50 border-white/10 text-white hover:bg-white/10"
                    : "bg-white/80 border-black/10 text-gray-700 hover:bg-white"
                    }`}
                >
                  {isFullscreen ? (
                    /* Minimize icon */
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25" />
                    </svg>
                  ) : (
                    /* Maximize icon */
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <Button size="sm" variant="outline" onClick={startOver} className={`!rounded-2xl !backdrop-blur-xl ${isDark ? "!bg-black/50 !border-white/10 text-white" : "!bg-white/80 !border-black/10 text-gray-700"
                  }`}>
                  Start Over
                </Button>
                <Button size="sm" variant="primary" onClick={() => window.print()} className="!rounded-2xl shadow-lg shadow-[var(--color-primary-500)]/40">
                  Export Plan
                </Button>
              </Panel>

              <Panel position="bottom-left" className={`backdrop-blur-2xl p-6 rounded-[2rem] border max-w-xs shadow-2xl m-6 ${isDark ? "bg-white/5 border-white/10" : "bg-white/80 border-black/10"
                }`}>
                <h4 className={`font-black text-xs uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"
                  }`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Navigator
                </h4>
                <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-white/50" : "text-gray-500"
                  }`}>
                  Welcome to your interactive career architecture. Connect with **Root** to see your foundation, or explore the **Branches** to discover your potential. Click any node for detailed action plans.
                </p>
              </Panel>
            </ReactFlow>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DETAILS MODAL ─────────────────────────────────────────────────── */}
      {selectedMilestone && (
        <Modal
          open={!!selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          title={selectedMilestone.title}
          size="lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

            {/* ── LEFT: Milestone Details ── */}
            <div className="flex flex-col gap-5">
              {/* Timeframe pill */}
              <div className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5 text-xs font-bold bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] border border-[var(--color-primary-500)]/20">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedMilestone.timeframe}
              </div>

              {/* Skills */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Skills to Acquire</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMilestone.skills.map((skill, i) => (
                    <span key={i} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-2.5 py-1 text-xs font-semibold text-[var(--color-text)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3">Execution Strategy</p>
                <ul className="space-y-2">
                  {selectedMilestone.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 hover:border-[var(--color-primary-400)]/50 transition-colors">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-500)]/10 text-[10px] font-black text-[var(--color-primary-500)]">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[var(--color-text)] leading-snug">{action}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── RIGHT: Learning Resources ── */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-400)]">Suggested Learning Resources</p>

              {resourcesLoading ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Finding resources...
                </div>
              ) : milestoneResources.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No resources found.</p>
              ) : (
                <>
                <div className="flex flex-col gap-3">
                  {milestoneResources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3.5 hover:border-[var(--color-primary-400)]/60 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-[var(--color-primary-500)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary-500)]">
                          {r.type}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[100px]">{r.source}</span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--color-text)] line-clamp-2 leading-snug group-hover:text-[var(--color-primary-500)] transition-colors">
                        {r.title}
                      </p>
                      <span className="mt-auto text-[10px] font-bold text-[var(--color-primary-500)] flex items-center gap-1">
                        Watch / Read
                        <svg className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
                <Link
                  href={"/learning-resources?q=" + encodeURIComponent(selectedMilestone.skills.slice(0, 3).join(" "))}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-border)] py-2 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]/60 hover:text-[var(--color-primary-500)] transition-colors"
                >
                  Show more resources
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                </>
              )}
            </div>

          </div>
        </Modal>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </PageShell>
  );
}
