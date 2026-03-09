"use client";

"use client";

import { useState, useRef, useEffect } from "react";
// @ts-ignore
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatedScoreCircle, AnimatedProgressBar } from "@/components/ui/ScoreVisuals";

const mockAnalysis = {
  resume: {
    strengths: ["Clear structure", "Relevant keywords", "Quantified achievements"],
    weaknesses: ["Missing skills section", "Length could be reduced"],
    suggestions: ["Add a 2–3 line summary at the top", "Include 2–3 core tools"],
    actionItems: ["Add summary", "Add skills section", "Trim to 1 page if possible"],
  },
  job: {
    strengths: ["Matches 70% of keywords", "Good cultural fit signals"],
    weaknesses: ["Experience section could emphasize leadership"],
    suggestions: ["Mirror phrases from the JD in your bullets", "Add a 'Relevant experience' subsection"],
    actionItems: ["Tailor top 3 bullets to JD", "Add 1 leadership example"],
  },
  career: {
    summary: "Software Engineering offers higher median salary and remote flexibility; Data Analytics has strong growth and lower barrier to entry. Both value problem-solving and technical skills.",
    comparison: [
      { dimension: "Salary range", A: "$70k–$150k", B: "$60k–$120k" },
      { dimension: "Remote work", A: "Very common", B: "Common" },
      { dimension: "Typical entry", A: "CS degree or bootcamp", B: "STEM or bootcamp" },
    ],
  },
};

const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="mt-8 mb-6 bg-gradient-to-r from-[var(--color-primary-600)] to-blue-500 bg-clip-text text-3xl font-extrabold text-transparent" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <div className="mt-10 mb-6 flex items-center gap-3 border-b-2 border-[var(--color-primary-200)] pb-2 dark:border-[var(--color-primary-900)]/50">
      <div className="h-2 w-2 rounded-full bg-[var(--color-primary-500)]" />
      <h2 className="text-xl font-bold text-[var(--color-text)]" {...props} />
    </div>
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mt-6 mb-3 text-lg font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-5 leading-relaxed text-[var(--color-text-muted)] text-[16px]" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-6 ml-2 space-y-3 list-none" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-6 ml-6 list-decimal space-y-3 text-[var(--color-text-muted)] marker:font-semibold marker:text-[var(--color-primary-600)]" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="relative pl-7 leading-relaxed text-[var(--color-text-muted)] text-[16px] before:absolute before:left-2 before:top-[10px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--color-primary-500)]" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-[var(--color-text)]" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="my-6 rounded-r-lg border-l-4 border-[var(--color-primary-500)] bg-[var(--color-primary-50)] py-4 pl-5 italic text-[var(--color-text-muted)] dark:bg-[var(--color-primary-900)]/20" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-10 border-t border-[var(--color-border)]" {...props} />
  ),
};

interface ResumeAnalysisPayload {
  overallScore: number;
  subScores: {
    impact: number;
    skills: number;
    formatting: number;
  };
  markdownReport: string;
}

export default function AnalyzePage() {
  const [resumeAnalysisData, setResumeAnalysisData] = useState<ResumeAnalysisPayload | null>(null);
  const [jobText, setJobText] = useState("");
  const [careerA, setCareerA] = useState("");
  const [careerB, setCareerB] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [result, setResult] = useState<"resume" | "job" | "career" | null>(null);
  const [activeTab, setActiveTab] = useState("resume");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("resumeAnalysisData");
    const savedResult = localStorage.getItem("analysisResultType");
    const savedTab = localStorage.getItem("analysisActiveTab");

    if (savedData) {
      try {
        setResumeAnalysisData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved resume data");
      }
    }
    if (savedResult) {
      setResult(savedResult as "resume" | "job" | "career");
    }
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (resumeAnalysisData) {
      localStorage.setItem("resumeAnalysisData", JSON.stringify(resumeAnalysisData));
    }
  }, [resumeAnalysisData]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("analysisResultType", result);
    }
  }, [result]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("analysisActiveTab", value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingFile(true);
    setResumeAnalysisData(null);
    setResult(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Clear previous storage when starting a new upload
      localStorage.removeItem("resumeAnalysisData");
      localStorage.removeItem("analysisResultType");
      localStorage.setItem("resumeFileName", file.name);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze file");
      }

      const data = await response.json();

      // Handle legacy API or direct markdown returns gracefully just in case
      if (typeof data.analysis === 'string') {
        setResumeAnalysisData({
          overallScore: 0,
          subScores: { impact: 0, skills: 0, formatting: 0 },
          markdownReport: data.analysis
        });
      } else {
        setResumeAnalysisData({
          overallScore: data.analysis.overallScore || 0,
          subScores: {
            impact: data.analysis.subScores?.impact || 0,
            skills: data.analysis.subScores?.skills || 0,
            formatting: data.analysis.subScores?.formatting || 0,
          },
          markdownReport: data.analysis.markdownReport || ""
        });
      }
      setResult("resume");
    } catch (error: any) {
      setErrorMessage(error.message || "Error reading file. Please try again.");
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };


  const runAnalysis = async (type: "resume" | "job" | "career") => {
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    setResult(type);
    setLoading(false);
  };

  return (
    <PageShell
      title="Analyze"
      description="AI-powered feedback on resumes, job descriptions, and career comparisons."
      maxWidth="xl"
    >
      <Tabs value={activeTab} onChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="resume">Resume analysis</TabsTrigger>
          <TabsTrigger value="job">Job description analysis</TabsTrigger>
          <TabsTrigger value="career">Career comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="resume">
          <Modal
            open={!!errorMessage}
            onClose={() => setErrorMessage(null)}
            title="Analysis Failed"
            size="sm"
          >
            <div className="flex flex-col items-center gap-4 text-center py-2">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {errorMessage}
              </p>
              <Button variant="primary" onClick={() => setErrorMessage(null)} className="mt-4 w-full">
                Understood
              </Button>
            </div>
          </Modal>
          <Card padding="lg" className="mb-6 relative overflow-hidden group border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-500)]/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="mb-2 text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)]"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                Upload your resume for AI analysis
              </h3>
              <p className="mb-6 text-base text-[var(--color-text-muted)]">
                Upload your resume to receive an in-depth ATS compatibility score, strengths, weaknesses, and actionable suggestions.
              </p>

              {!parsingFile ? (
                <div
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] dark:hover:bg-[var(--color-primary-900)]/20 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-text-muted)] mb-3 group-hover:text-[var(--color-primary-500)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="font-medium text-[var(--color-text)]">Click to browse or drag and drop</p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">Supports .pdf, .docx, .txt (Max 5MB)</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.docx"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--color-primary-500)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-3 h-3 bg-[var(--color-primary-500)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-3 h-3 bg-[var(--color-primary-500)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <p className="mt-4 font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)] animate-pulse">
                    Analyzing Resume with AI...
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">This might take a few seconds.</p>
                </div>
              )}
            </div>
          </Card>
          {(result === "resume" && resumeAnalysisData) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Graphical Dashboard */}
              <Card padding="lg" className="bg-white dark:bg-[var(--color-card)] shadow-lg border border-[var(--color-border)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Overall ATS Score Radial Circle */}
                  <div className="flex-1 flex justify-center md:border-r border-[var(--color-border)] md:pr-8 relative">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-primary-500)]/10 to-transparent blur-2xl rounded-full" />
                    <AnimatedScoreCircle score={resumeAnalysisData.overallScore} label="ATS Match Score" />
                  </div>

                  {/* Sub-Metric Horizontal Bars */}
                  <div className="flex-[2] w-full pt-4 md:pt-0">
                    <h4 className="text-xl font-extrabold text-[var(--color-text)] mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)]"><path d="M12 20v-6M6 20V10M18 20V4" /></svg>
                      Detailed Metric Checks
                    </h4>
                    <AnimatedProgressBar label="Impact & Measurable Results" score={resumeAnalysisData.subScores.impact} />
                    <AnimatedProgressBar label="Skills & Keyword Optimization" score={resumeAnalysisData.subScores.skills} />
                    <AnimatedProgressBar label="Formatting & Parsing Structure" score={resumeAnalysisData.subScores.formatting} />
                  </div>
                </div>
              </Card>

              {/* Detailed Markdown Report */}
              <Card padding="lg" className="overflow-hidden bg-white dark:bg-[var(--color-card)] shadow-lg border border-[var(--color-border)]">
                <div className="mb-8 flex flex-col items-center border-b-2 border-[var(--color-primary-100)] dark:border-[var(--color-primary-900)] pb-6 sm:flex-row sm:justify-between">
                  <h3 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary-500)]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    In-Depth Analysis Report
                  </h3>
                </div>
                <div className="markdown-content max-w-4xl mx-auto py-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {resumeAnalysisData.markdownReport || "Parsing previous data... Please refresh the page or upload again."}
                  </ReactMarkdown>
                </div>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="job">
          <Card padding="lg" className="mb-6">
            <h3 className="mb-2 font-semibold text-[var(--color-text)]">
              Paste the job description
            </h3>
            <Textarea
              placeholder="Paste the full job description to get tailored resume and cover letter suggestions."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={8}
              className="mb-4"
            />
            <Button
              variant="primary"
              loading={loading}
              onClick={() => runAnalysis("job")}
              disabled={!jobText.trim()}
            >
              Run analysis
            </Button>
          </Card>
          {result === "job" && (
            <Card padding="lg">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">
                Analysis results
              </h3>
              <Section title="Strengths" items={mockAnalysis.job.strengths} variant="success" />
              <Section title="Gaps" items={mockAnalysis.job.weaknesses} variant="warning" />
              <Section title="Suggestions" items={mockAnalysis.job.suggestions} />
              <Section title="Action items" items={mockAnalysis.job.actionItems} variant="primary" />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="career">
          <Card padding="lg" className="mb-6">
            <h3 className="mb-2 font-semibold text-[var(--color-text)]">
              Compare two career paths
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Career A</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering"
                  value={careerA}
                  onChange={(e) => setCareerA(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Career B</label>
                <input
                  type="text"
                  placeholder="e.g. Data Analytics"
                  value={careerB}
                  onChange={(e) => setCareerB(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                />
              </div>
            </div>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => runAnalysis("career")}
              disabled={!careerA.trim() || !careerB.trim()}
              className="mt-4"
            >
              Compare careers
            </Button>
          </Card>
          {result === "career" && (
            <Card padding="lg">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">
                Comparison summary
              </h3>
              <p className="text-[var(--color-text-muted)]">
                {mockAnalysis.career.summary}
              </p>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="py-2 font-medium">Dimension</th>
                    <th className="py-2 font-medium">Career A</th>
                    <th className="py-2 font-medium">Career B</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAnalysis.career.comparison.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)]">
                      <td className="py-2">{row.dimension}</td>
                      <td className="py-2">{row.A}</td>
                      <td className="py-2">{row.B}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function Section({
  title,
  items,
  variant = "default",
}: {
  title: string;
  items: string[];
  variant?: "default" | "primary" | "success" | "warning";
}) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 font-medium text-[var(--color-text)]">{title}</h4>
      <ul className="list-inside list-disc space-y-1 text-sm text-[var(--color-text-muted)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
