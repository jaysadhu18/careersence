"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

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

export default function AnalyzePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [careerA, setCareerA] = useState("");
  const [careerB, setCareerB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"resume" | "job" | "career" | null>(null);

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
      <Tabs defaultValue="resume">
        <TabsList>
          <TabsTrigger value="resume">Resume analysis</TabsTrigger>
          <TabsTrigger value="job">Job description analysis</TabsTrigger>
          <TabsTrigger value="career">Career comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="resume">
          <Card padding="lg" className="mb-6">
            <h3 className="mb-2 font-semibold text-[var(--color-text)]">
              Paste your resume (or a section)
            </h3>
            <Textarea
              placeholder="Paste resume text here. You can also upload a file (coming soon)."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="mb-4"
            />
            <Button
              variant="primary"
              loading={loading}
              onClick={() => runAnalysis("resume")}
              disabled={!resumeText.trim()}
            >
              Run analysis
            </Button>
          </Card>
          {result === "resume" && (
            <Card padding="lg">
              <h3 className="mb-4 font-semibold text-[var(--color-text)]">
                Analysis results
              </h3>
              <Section title="Strengths" items={mockAnalysis.resume.strengths} variant="success" />
              <Section title="Areas to improve" items={mockAnalysis.resume.weaknesses} variant="warning" />
              <Section title="Suggestions" items={mockAnalysis.resume.suggestions} />
              <Section title="Action items" items={mockAnalysis.resume.actionItems} variant="primary" />
            </Card>
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
