"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Printer, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";

interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  status: string;
}

interface TailoredResumeData {
  name?: string;
  contact?: {
    location: string;
    phone: string;
    email: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  skills?: {
    categories?: {
      name: string;
      skills: string;
    }[];
  };
  experience?: {
    company: string;
    location: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  projects?: {
    name: string;
    technologies: string;
    githubUrl: string;
    highlights: string[];
  }[];
  education?: {
    institution: string;
    location: string;
    degree: string;
    duration: string;
  }[];
  publicationsAchievementsCertifications?: {
    text: string;
    link?: string;
    linkLabel?: string;
  }[];
}

interface ScreeningAnswer {
  question: string;
  answer: string;
}

interface ApplicationData {
  fitScore: number;
  fitAnalysis: string;
  tailoredCoverLetter: string;
  tailoredResume: TailoredResumeData;
  screeningAnswers: ScreeningAnswer[];
}

export default function AIJobTailorPage() {
  const { id: savedJobId } = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core State
  const [savedJob, setSavedJob] = useState<SavedJob | null>(null);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Input States
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [customJobDesc, setCustomJobDesc] = useState("");
  const [showManualDesc, setShowManualDesc] = useState(false);

  // Tab State
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("resume");

  // Copy State Helpers
  const [copiedText, setCopiedText] = useState<Record<string, boolean>>({});

  // Loading Message Cycle
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Reading job requirements...",
    "Analyzing skills alignment and Indian market benchmarks...",
    "Drafting customized CV professional summary...",
    "Tailoring experience bullet points (ATS friendly)...",
    "Writing personalized cover letter...",
    "Generating standard Indian interview screening answers...",
    "Reviewing for accuracy and tone..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tailoring) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [tailoring]);

  // Load Job and Existing Tailoring data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/applications/tailor?savedJobId=${savedJobId}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Failed to load job details.");
          return;
        }

        setSavedJob(data.savedJob);

        if (data.application) {
          const app = data.application;
          let resumeObj: TailoredResumeData = {};
          let answersObj: ScreeningAnswer[] = [];

          try {
            resumeObj = typeof app.tailoredResume === "string" ? JSON.parse(app.tailoredResume) : app.tailoredResume;
            answersObj = typeof app.screeningAnswers === "string" ? JSON.parse(app.screeningAnswers) : app.screeningAnswers;
          } catch (e) {
            console.error("Failed parsing stored JSON fields:", e);
          }

          setApplication({
            fitScore: app.fitScore,
            fitAnalysis: app.fitAnalysis,
            tailoredCoverLetter: app.tailoredCoverLetter,
            tailoredResume: resumeObj,
            screeningAnswers: answersObj,
          });
        }

        // Cache restore resume
        const cachedResume = sessionStorage.getItem("careersence-master-resume");
        const cachedFilename = sessionStorage.getItem("careersence-resume-filename");
        if (cachedResume) {
          setResumeText(cachedResume);
          if (cachedFilename) setFileName(cachedFilename);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }

    if (savedJobId) {
      loadData();
    }
  }, [savedJobId]);

  // Resume File Upload & Parsing Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingResume(true);
    setError("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      setResumeText(data.text);
      sessionStorage.setItem("careersence-master-resume", data.text);
      sessionStorage.setItem("careersence-resume-filename", file.name);
      setSuccessMsg("Resume successfully uploaded and parsed!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to read resume file.");
      setFileName("");
    } finally {
      setParsingResume(false);
    }
  };

  // Tailor Action trigger
  const handleTailorApplication = async () => {
    if (!resumeText.trim()) {
      setError("Please upload a resume first.");
      return;
    }

    setError("");
    setTailoring(true);
    setLoadingStep(0);

    try {
      const res = await fetch("/api/applications/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          savedJobId,
          resumeText,
          customJobDescription: customJobDesc || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to tailor application.");
      }

      const app = data.application;
      let resumeObj = {};
      let answersObj = [];

      try {
        resumeObj = typeof app.tailoredResume === "string" ? JSON.parse(app.tailoredResume) : app.tailoredResume;
        answersObj = typeof app.screeningAnswers === "string" ? JSON.parse(app.screeningAnswers) : app.screeningAnswers;
      } catch (e) {
        console.error("Failed to parse response JSON fields:", e);
      }

      setApplication({
        fitScore: app.fitScore,
        fitAnalysis: app.fitAnalysis,
        tailoredCoverLetter: app.tailoredCoverLetter,
        tailoredResume: resumeObj as TailoredResumeData,
        screeningAnswers: answersObj as ScreeningAnswer[],
      });
      
      setSuccessMsg("Application tailored successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to customize details.");
    } finally {
      setTailoring(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedText((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // Loading Skeleton
  if (loading) {
    return (
      <PageShell title="Loading AI Workspace">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary-500)]" />
          <p className="text-[var(--color-text-muted)] animate-pulse">Loading AI Application workspace...</p>
        </div>
      </PageShell>
    );
  }

  if (!savedJob) {
    return (
      <PageShell title="Job Not Found">
        <div className="max-w-xl mx-auto mt-10 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Job Listing Not Found</h2>
          <p className="text-[var(--color-text-muted)] mb-6">The job you are attempting to tailor does not exist or has been deleted.</p>
          <Button onClick={() => router.push("/job-hunting")}>Return to Job Hunting Board</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="AI Job Tailor">
      {/* Print styles inserted directly to avoid scope issues */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            background: transparent !important;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
            color: #000000 !important;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Link */}
        <LinkButton href="/job-hunting" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6 transition-all duration-200">
          <ArrowLeft className="h-4 w-4" /> Back to Job Tracking
        </LinkButton>

        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-100)]">
                {savedJob.source}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {savedJob.location || "India"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--color-text-strong)]">{savedJob.title}</h1>
            <p className="text-lg text-[var(--color-text-muted)] font-medium mt-0.5">{savedJob.company}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowManualDesc(!showManualDesc)}
              className="text-xs"
            >
              {showManualDesc ? "Hide Job Description" : "View/Add Job Description"}
            </Button>
            <Button
              onClick={() => window.open(savedJob.url, "_blank")}
              className="flex items-center gap-2 bg-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-700)] text-white w-full md:w-auto"
            >
              Apply on Platform <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Job Description Textarea Drawer (Optional/Edit) */}
        {showManualDesc && (
          <Card className="mb-6 p-4 border-[var(--color-border)] shadow-soft">
            <h3 className="font-semibold text-sm mb-2 text-[var(--color-text)]">
              Job Description (Add or edit description details to improve tailoring accuracy):
            </h3>
            <Textarea
              rows={6}
              value={customJobDesc}
              onChange={(e) => setCustomJobDesc(e.target.value)}
              placeholder="Paste full job description from LinkedIn / Naukri here..."
              className="text-sm bg-[var(--color-background)] border-[var(--color-border)] mb-2"
            />
            <p className="text-xs text-[var(--color-text-muted)]">
              Note: If left blank, CareerSence will attempt to automatically fetch the description using the JSearch API.
            </p>
          </Card>
        )}

        {/* MAIN CONTROLS: Upload and Generate */}
        {!application && !tailoring && (
          <div className="max-w-2xl mx-auto py-10">
            <Card className="p-8 border-dashed border-2 border-[var(--color-border)] text-center flex flex-col items-center bg-[var(--color-surface)] shadow-soft">
              <UploadCloud className="h-14 w-14 text-[var(--color-primary-400)] mb-4" />
              <h3 className="text-xl font-bold text-[var(--color-text-strong)] mb-2">Upload your Master Resume</h3>
              <p className="text-[var(--color-text-muted)] text-sm max-w-md mb-6">
                Upload your latest resume (.pdf, .docx, or .txt). Gemini will automatically analyze it and build a custom, tailored resume to match this job listing.
              </p>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={parsingResume}
                  variant="outline"
                  className="flex items-center gap-2 border-[var(--color-primary-300)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
                >
                  {parsingResume ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Parsing Resume...
                    </>
                  ) : (
                    <>Select Resume File</>
                  )}
                </Button>

                {resumeText && (
                  <Button
                    onClick={handleTailorApplication}
                    className="flex items-center gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white"
                  >
                    Tailor with Gemini <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {fileName && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)] bg-[var(--color-background)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                  <FileText className="h-4 w-4 text-[var(--color-primary-500)]" />
                  <span>{fileName}</span>
                  <button 
                    onClick={() => {
                      setResumeText("");
                      setFileName("");
                      sessionStorage.removeItem("careersence-master-resume");
                      sessionStorage.removeItem("careersence-resume-filename");
                    }} 
                    className="text-red-500 hover:text-red-700 ml-1 font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* LOADING STATE */}
        {tailoring && (
          <div className="max-w-md mx-auto py-12 text-center flex flex-col items-center">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] animate-spin"></div>
              <Sparkles className="h-6 w-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-strong)] mb-2">Tailoring Application Details</h3>
            <div className="h-10">
              <p className="text-sm text-[var(--color-text-muted)] animate-pulse transition-all duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          </div>
        )}

        {/* AI WORKSPACE GRID (Left, Center, Right Panels) */}
        {application && !tailoring && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
            
            {/* LEFT PANEL: Fit Analysis & Scoring (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft">
                <h3 className="font-bold text-sm text-[var(--color-text-strong)] mb-4 tracking-wider uppercase">
                  AI Fit Assessment
                </h3>
                
                {/* Score Dial */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-8 border-[var(--color-background)]">
                    {/* Simplified visual gauge */}
                    <div 
                      className={`absolute inset-0 rounded-full border-8 border-transparent transition-all duration-500`}
                      style={{
                        borderColor: application.fitScore >= 80 ? "#22c55e" : application.fitScore >= 60 ? "#f59e0b" : "#ef4444",
                        transform: `rotate(${application.fitScore * 3.6}deg)`,
                        clipPath: 'polygon(50% 50%, -50% -50%, 150% -50%)' // Just simple dial simulation
                      }}
                    />
                    <span className="text-3xl font-black text-[var(--color-text-strong)]">
                      {application.fitScore}%
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] mt-2 font-medium">
                    ATS Match Strength
                  </span>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                    Alignment Analysis:
                  </h4>
                  <p className="text-xs text-[var(--color-text)] leading-relaxed bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-border)]">
                    {application.fitAnalysis}
                  </p>
                </div>

                {/* Re-generate button */}
                <div className="border-t border-[var(--color-border)] mt-4 pt-4 flex flex-col gap-2">
                  <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                    Adjusted master resume? Tailor again:
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTailorApplication}
                    className="w-full text-xs"
                  >
                    Re-tailor with Gemini
                  </Button>
                </div>
              </Card>
            </div>

            {/* CENTER PANEL: Tailored Documents (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft">
                
                {/* Tabs selection header */}
                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3 mb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveWorkspaceTab("resume")}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                        activeWorkspaceTab === "resume"
                          ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
                      }`}
                    >
                      Tailored Resume
                    </button>
                    <button
                      onClick={() => setActiveWorkspaceTab("coverletter")}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200 ${
                        activeWorkspaceTab === "coverletter"
                          ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-background)]"
                      }`}
                    >
                      Cover Letter
                    </button>
                  </div>

                  {activeWorkspaceTab === "resume" ? (
                    <Button
                      size="sm"
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white text-xs py-1"
                    >
                      <Printer className="h-3.5 w-3.5" /> PDF / Print
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(application.tailoredCoverLetter, "cover")}
                      className="flex items-center gap-2 text-xs py-1"
                    >
                      {copiedText["cover"] ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Letter
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Workspace tab views */}
                <div>
                  {activeWorkspaceTab === "resume" ? (
                    /* RENDER TAILORED RESUME (Styled as standard clean white resume sheet) */
                    <div className="bg-gray-100 p-4 sm:p-6 rounded-lg border border-[var(--color-border)] max-h-[70vh] overflow-y-auto">
                      <div
                        id="printable-resume"
                        className="bg-white text-black p-8 shadow-md rounded border border-gray-200 max-w-[210mm] mx-auto text-left font-serif leading-relaxed text-xs"
                      >
                        {/* Header */}
                        <div className="text-center pb-4 mb-4">
                          <h2 className="text-2xl font-normal tracking-wide text-gray-900 uppercase">
                            {application.tailoredResume.name || "Dev Patel"}
                          </h2>
                          <div className="text-[10px] text-gray-700 flex flex-wrap justify-center items-center gap-1.5 mt-1 font-sans">
                            <span>{application.tailoredResume.contact?.location || "Gujarat, India"}</span>
                            <span>|</span>
                            <span>{application.tailoredResume.contact?.phone || "+91-9313143862"}</span>
                            <span>|</span>
                            {application.tailoredResume.contact?.email && (
                              <>
                                <a href={`mailto:${application.tailoredResume.contact.email}`} className="underline text-black hover:text-gray-700">
                                  {application.tailoredResume.contact.email}
                                </a>
                                <span>|</span>
                              </>
                            )}
                            {application.tailoredResume.contact?.github && (
                              <>
                                <a href={application.tailoredResume.contact.github} target="_blank" rel="noopener noreferrer" className="underline text-black hover:text-gray-700">
                                  {application.tailoredResume.contact.github.replace(/^https?:\/\/(www\.)?github\.com\//i, "GitHub: ")}
                                </a>
                                <span>|</span>
                              </>
                            )}
                            {application.tailoredResume.contact?.linkedin && (
                              <>
                                <a href={application.tailoredResume.contact.linkedin} target="_blank" rel="noopener noreferrer" className="underline text-black hover:text-gray-700">
                                  LinkedIn
                                </a>
                                <span>|</span>
                              </>
                            )}
                            {application.tailoredResume.contact?.portfolio && (
                              <a href={application.tailoredResume.contact.portfolio} target="_blank" rel="noopener noreferrer" className="underline text-black hover:text-gray-700">
                                Portfolio
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Experience Section */}
                        <div className="mb-4">
                          <h3 className="font-bold text-xs uppercase text-gray-800 tracking-wider border-b border-gray-300 pb-0.5 mb-2 font-sans">
                            Professional Experience
                          </h3>
                          {(application.tailoredResume.experience || []).map((exp, idx) => (
                            <div key={idx} className="mb-3 text-xs">
                              <div className="flex justify-between font-bold text-gray-900 font-sans">
                                <span>{exp.company}</span>
                                <span className="font-normal text-gray-700">{exp.location}</span>
                              </div>
                              <div className="flex justify-between text-[11px] italic text-gray-600 font-sans -mt-0.5">
                                <span>{exp.role}</span>
                                <span>{exp.duration}</span>
                              </div>
                              <ul className="list-disc pl-5 text-gray-800 space-y-0.5 mt-1">
                                {(exp.highlights || []).map((hl, hIdx) => (
                                  <li key={hIdx} className="text-justify leading-relaxed">
                                    {hl}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Projects Section */}
                        {application.tailoredResume.projects && application.tailoredResume.projects.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-bold text-xs uppercase text-gray-800 tracking-wider border-b border-gray-300 pb-0.5 mb-2 font-sans">
                              Key Projects
                            </h3>
                            {application.tailoredResume.projects.map((proj, idx) => (
                              <div key={idx} className="mb-3 text-xs">
                                <div className="flex justify-between font-bold text-gray-900 font-sans">
                                  <span>{proj.name}</span>
                                  {proj.githubUrl && (
                                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800 font-normal">
                                      GitHub
                                    </a>
                                  )}
                                </div>
                                <div className="text-[11px] italic text-gray-600 font-sans -mt-0.5 mb-1">
                                  {proj.technologies}
                                </div>
                                <ul className="list-disc pl-5 text-gray-800 space-y-0.5">
                                  {(proj.highlights || []).map((hl, hIdx) => (
                                    <li key={hIdx} className="text-justify leading-relaxed">
                                      {hl}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Skills Section */}
                        {application.tailoredResume.skills?.categories && application.tailoredResume.skills.categories.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-bold text-xs uppercase text-gray-800 tracking-wider border-b border-gray-300 pb-0.5 mb-2 font-sans">
                              Technical Skills
                            </h3>
                            <div className="space-y-1 text-xs text-gray-800 font-sans">
                              {application.tailoredResume.skills.categories.map((cat, idx) => (
                                <div key={idx}>
                                  <strong>{cat.name}: </strong>
                                  <span>{cat.skills}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education Section */}
                        {application.tailoredResume.education && application.tailoredResume.education.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-bold text-xs uppercase text-gray-800 tracking-wider border-b border-gray-300 pb-0.5 mb-2 font-sans">
                              Education
                            </h3>
                            {application.tailoredResume.education.map((edu, idx) => (
                              <div key={idx} className="mb-2 text-xs">
                                <div className="flex justify-between font-bold text-gray-900 font-sans">
                                  <span>{edu.institution}</span>
                                  <span className="font-normal text-gray-700">{edu.location}</span>
                                </div>
                                <div className="flex justify-between text-[11px] italic text-gray-600 font-sans -mt-0.5">
                                  <span>{edu.degree}</span>
                                  <span>{edu.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Publications & Certifications Section */}
                        {application.tailoredResume.publicationsAchievementsCertifications && application.tailoredResume.publicationsAchievementsCertifications.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-bold text-xs uppercase text-gray-800 tracking-wider border-b border-gray-300 pb-0.5 mb-2 font-sans">
                              Publications, Achievements & Certifications
                            </h3>
                            <ul className="list-disc pl-5 text-gray-800 space-y-1">
                              {application.tailoredResume.publicationsAchievementsCertifications.map((item, idx) => (
                                <li key={idx} className="text-justify leading-relaxed text-xs">
                                  <span>{item.text} </span>
                                  {item.link && (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800 font-sans">
                                      {item.linkLabel || "Link"}
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>
                  ) : (
                    /* RENDER TAILORED COVER LETTER */
                    <div className="bg-[var(--color-background)] p-4 sm:p-6 rounded-lg border border-[var(--color-border)] max-h-[70vh] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-xs text-[var(--color-text)] leading-relaxed">
                        {application.tailoredCoverLetter}
                      </pre>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* RIGHT PANEL: Screening Q&A & Quick Apply Guide (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <Card className="p-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-soft">
                <h3 className="font-bold text-sm text-[var(--color-text-strong)] mb-4 tracking-wider uppercase">
                  Indian Screening Helper
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Standard interview screening questions and answers based on your background. Copy these directly when filling out application forms:
                </p>

                <div className="flex flex-col gap-4">
                  {(application.screeningAnswers || []).map((qna, idx) => (
                    <div key={idx} className="p-3 bg-[var(--color-background)] rounded-lg border border-[var(--color-border)]">
                      <h4 className="font-bold text-xs text-[var(--color-text)] mb-1">
                        Q: {qna.question}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-2.5">
                        {qna.answer}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(qna.answer, `qna-${idx}`)}
                        className="flex items-center gap-1.5 w-full justify-center text-[10px] py-1 border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                      >
                        {copiedText[`qna-${idx}`] ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy Answer
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Guide card */}
              <Card className="p-6 border-[var(--color-border)] bg-gradient-to-tr from-[var(--color-primary-50)] to-[var(--color-secondary-50)] shadow-soft">
                <h4 className="font-bold text-xs text-[var(--color-text-strong)] mb-2 uppercase">
                  How to Apply (Fast Route)
                </h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-[var(--color-text)]">
                  <li>Click <strong>PDF / Print</strong> and save your tailored resume to your local computer.</li>
                  <li>Toggle the <strong>Cover Letter</strong> tab, and click copy.</li>
                  <li>Click the <strong>Apply on Platform</strong> CTA to go to Naukri/LinkedIn/Indeed.</li>
                  <li>Paste cover letter/screening answers and upload your PDF. Done!</li>
                </ol>
              </Card>
            </div>

          </div>
        )}
      </div>
    </PageShell>
  );
}

// Simple internal LinkButton helper
function LinkButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
