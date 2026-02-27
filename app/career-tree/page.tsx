"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Badge } from "@/components/ui/Badge";

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

const RootNode = ({ data }: { data: { title: string; description: string; skills: string[] } }) => (
  <div className="node-root group">
    <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-inner ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-500">
        <svg className="h-9 w-9 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-xl font-black tracking-tight text-white uppercase">{data.title}</h3>
      <p className="mt-3 text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-widest">
        Starting Point
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {data.skills.map((s, i) => (
          <span key={i} className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md">
            {s}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const MilestoneNode = ({ data }: { data: Milestone & { color: string; onShowDetails: (m: Milestone) => void } }) => (
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
      <div className="node-milestone-header text-center group-hover:text-white transition-colors">
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
  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

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
            labelBgStyle: { fill: "#030712", fillOpacity: 0.8, rx: 6 },
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
      setView("tree");
    } catch {
      setError("Network error. Please try again.");
      setView("form");
    }
  };

  const startOver = () => {
    setView("form");
    setStep(1);
    setForm(initialForm);
    setNodes([]);
    setEdges([]);
    setError("");
  };

  // ── Step labels
  const stepLabels = ["Skills & Passions", "Your Roles", "Your Goals"];
  const stepIcons = [
    "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  ];

  return (
    <PageShell
      title="Career Tree"
      description="Map your professional progression — assess your strengths, explore career paths, and define your goals. We'll generate a personalized interactive career tree."
      maxWidth="xl"
    >
      {/* ── FORM VIEW ─────────────────────────────────────────────────────── */}
      {view === "form" && (
        <div className="mx-auto max-w-2xl">
          <Card
            padding="lg"
            className="border-2 border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] shadow-[var(--shadow-lg)]"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)] text-white shadow-lg">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stepIcons[step - 1]} />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                  Step {step} of {totalSteps}
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">{stepLabels[step - 1]}</h2>
              </div>
            </div>

            <StepIndicator step={step} total={totalSteps} />

            {error && (
              <div
                className="mb-4 rounded-lg border border-[var(--color-error)] bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-300"
                role="alert"
              >
                {error}
              </div>
            )}

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
        </div>
      )}

      {/* ── LOADING VIEW ──────────────────────────────────────────────────── */}
      {view === "loading" && (
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
                <div
                  className="h-full bg-[var(--color-primary-500)]"
                  style={{
                    width: '100%',
                    animation: `shimmer 1.5s infinite ${i * 0.2}s`
                  }}
                />
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* ── TREE VIEW ─────────────────────────────────────────────────────── */}
      {view === "tree" && (
        <div className="h-[800px] w-full relative rounded-[2.5rem] border border-white/5 bg-[#030712] overflow-hidden shadow-2xl">
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
            <Background color="#1f2937" size={1.5} gap={24} variant={"dots" as any} />
            <Controls className="!bg-black/50 !border-white/10 !rounded-2xl backdrop-blur-xl" />

            <Panel position="top-right" className="flex gap-3">
              <Button size="sm" variant="outline" onClick={startOver} className="!rounded-2xl !bg-black/50 !backdrop-blur-xl !border-white/10 text-white">
                Start Over
              </Button>
              <Button size="sm" variant="primary" onClick={() => window.print()} className="!rounded-2xl shadow-lg shadow-[var(--color-primary-500)]/40">
                Export Plan
              </Button>
            </Panel>

            <Panel position="bottom-left" className="bg-white/5 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 max-w-xs shadow-2xl m-6">
              <h4 className="font-black text-white text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Navigator
              </h4>
              <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                Welcome to your interactive career architecture. Connect with **Root** to see your foundation, or explore the **Branches** to discover your potential. Click any node for detailed action plans.
              </p>
            </Panel>
          </ReactFlow>
        </div>
      )}

      {/* ── DETAILS MODAL ─────────────────────────────────────────────────── */}
      {selectedMilestone && (
        <Modal
          open={!!selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          title={selectedMilestone.title}
          size="md"
        >
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary-500)] mb-2">
                Timeframe
              </div>
              <div className="inline-block rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] px-4 py-2 text-sm font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-200)] border border-[var(--color-primary-100)] dark:border-[var(--color-primary-800)]">
                {selectedMilestone.timeframe}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-secondary-500)] mb-3">
                Skills to Acquire
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMilestone.skills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-1 px-3 !rounded-lg border-[var(--color-border)]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">
                Execution Strategy
              </div>
              <ul className="space-y-3">
                {selectedMilestone.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 hover:border-[var(--color-primary-300)] transition-colors group">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] text-[10px] font-black text-[var(--color-primary-600)] group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[var(--color-text)] font-medium leading-relaxed">
                      {action}
                    </p>
                  </li>
                ))}
              </ul>
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
