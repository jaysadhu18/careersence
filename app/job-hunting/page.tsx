"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCountries, getStates, getCities } from "@/lib/location-data";

// ─── Job Titles / Keywords List ───────────────────────────────────────────────

const JOB_TITLES = [
  // ── Software & Web Development ──
  "Software Engineer", "Software Developer", "Software Development",
  "Frontend Developer", "Frontend Development", "Frontend Engineer",
  "Backend Developer", "Backend Development", "Backend Engineer",
  "Full Stack Developer", "Full Stack Engineer", "Full Stack Development",
  "Web Developer", "Web Development", "Web Designer",
  "React Developer", "React.js Developer", "Next.js Developer",
  "Angular Developer", "Vue.js Developer", "JavaScript Developer",
  "TypeScript Developer", "Node.js Developer", "Express.js Developer",
  "Python Developer", "Python Development", "Django Developer", "Flask Developer",
  "Java Developer", "Java Development", "Spring Boot Developer",
  "PHP Developer", "Laravel Developer", "WordPress Developer",
  "Ruby on Rails Developer", "Go Developer", "Rust Developer",
  "C++ Developer", "C# Developer", ".NET Developer", "ASP.NET Developer",
  "Mobile Developer", "Mobile App Development", "Mobile App Developer",
  "iOS Developer", "Swift Developer", "Objective-C Developer",
  "Android Developer", "Kotlin Developer", "Flutter Developer",
  "React Native Developer", "Xamarin Developer", "Cross Platform Developer",
  // ── Data & Analytics ──
  "Data Analyst", "Data Analysis", "Data Analytics",
  "Data Scientist", "Data Science", "Data Science Intern",
  "Data Engineer", "Data Engineering", "Data Pipeline Engineer",
  "Business Intelligence Analyst", "Business Intelligence", "BI Developer",
  "Business Analyst", "Business Analysis",
  "Database Administrator", "Database Developer", "Database Engineer",
  "SQL Developer", "MySQL Developer", "PostgreSQL Developer",
  "NoSQL Developer", "MongoDB Developer", "Elasticsearch Engineer",
  "Analytics Engineer", "Quantitative Analyst", "Statistical Analyst",
  "Market Research Analyst", "Research Analyst", "Product Analyst",
  "Reporting Analyst", "Data Visualization Specialist", "Tableau Developer",
  "Power BI Developer", "Data Warehouse Engineer", "ETL Developer",
  // ── AI & Machine Learning ──
  "Machine Learning Engineer", "Machine Learning", "ML Engineer",
  "AI Engineer", "Artificial Intelligence", "AI Developer",
  "Deep Learning Engineer", "Deep Learning", "NLP Engineer",
  "Natural Language Processing", "Computer Vision Engineer", "Computer Vision",
  "LLM Engineer", "Generative AI Engineer", "Prompt Engineer",
  "AI Research Scientist", "Research Scientist", "Applied Scientist",
  "MLOps Engineer", "AI Intern",
  // ── DevOps, Cloud & Infrastructure ──
  "DevOps Engineer", "DevOps", "Site Reliability Engineer", "SRE",
  "Cloud Engineer", "Cloud Computing", "Cloud Architect",
  "AWS Engineer", "AWS Developer", "AWS Solutions Architect",
  "Azure Engineer", "Azure Developer", "GCP Engineer",
  "Google Cloud Engineer", "Infrastructure Engineer", "Platform Engineer",
  "Kubernetes Engineer", "Docker Engineer", "Linux Administrator",
  "Systems Administrator", "Systems Engineer", "IT Infrastructure",
  "Network Engineer", "Network Administrator", "Network Security Engineer",
  // ── Cybersecurity ──
  "Cybersecurity Engineer", "Cybersecurity Analyst", "Cybersecurity",
  "Information Security Analyst", "Information Security", "Security Engineer",
  "Penetration Tester", "Ethical Hacker", "SOC Analyst",
  "Security Operations", "Threat Intelligence Analyst", "Identity Access Management",
  // ── QA & Testing ──
  "QA Engineer", "Quality Assurance Engineer", "Quality Assurance",
  "Test Engineer", "Software Tester", "Manual Tester",
  "Automation Test Engineer", "Test Automation", "Selenium Tester",
  "Performance Test Engineer", "SDET",
  // ── Embedded & Hardware ──
  "Embedded Systems Engineer", "Embedded Developer", "Firmware Engineer",
  "Hardware Engineer", "VLSI Engineer", "FPGA Developer",
  "IoT Engineer", "Internet of Things", "Robotics Engineer",
  // ── Emerging Tech ──
  "Blockchain Developer", "Blockchain Engineer", "Blockchain",
  "Web3 Developer", "Smart Contract Developer", "Solidity Developer",
  "Game Developer", "Game Development", "Unity Developer", "Unreal Engine Developer",
  "AR/VR Developer", "Augmented Reality", "Virtual Reality", "XR Developer",
  "Metaverse Developer", "3D Developer",
  // ── Design & UX ──
  "UI/UX Designer", "UI Designer", "UX Designer", "UX Design",
  "Product Designer", "Product Design", "Interaction Designer",
  "Graphic Designer", "Graphic Design", "Visual Designer",
  "Motion Designer", "Motion Graphics", "Video Editor",
  "UX Researcher", "UX Research", "Usability Analyst",
  "Brand Designer", "Logo Designer", "Illustration Artist",
  "Figma Designer", "Adobe XD Designer", "Prototyping",
  // ── Product & Project Management ──
  "Product Manager", "Product Management", "Senior Product Manager",
  "Project Manager", "Project Management", "IT Project Manager",
  "Program Manager", "Technical Program Manager", "Delivery Manager",
  "Scrum Master", "Agile Coach", "Agile Project Management",
  "Engineering Manager", "Technical Lead", "Tech Lead",
  "CTO", "VP of Engineering", "Head of Engineering",
  "IT Consultant", "IT Manager", "IT Director",
  "Solutions Architect", "Technical Architect", "Enterprise Architect",
  // ── Marketing & Growth ──
  "Digital Marketing Manager", "Digital Marketing", "Digital Marketer",
  "SEO Specialist", "SEO Analyst", "Search Engine Optimization",
  "SEM Specialist", "Google Ads Specialist", "PPC Specialist",
  "Content Writer", "Content Marketing", "Content Strategist",
  "Copywriter", "Technical Writer", "Blog Writer",
  "Social Media Manager", "Social Media Marketing", "Community Manager",
  "Growth Hacker", "Growth Marketing", "Performance Marketing Manager",
  "Email Marketing Specialist", "CRM Manager", "Marketing Analyst",
  "Brand Manager", "Brand Marketing", "PR Manager",
  "Video Content Creator", "YouTuber", "Influencer Marketing Manager",
  // ── Sales & Business Development ──
  "Sales Executive", "Sales Representative", "Sales Manager",
  "Business Development Manager", "Business Development", "BDM",
  "Account Manager", "Account Executive", "Key Account Manager",
  "Inside Sales", "Field Sales Representative", "Pre-Sales Consultant",
  "Sales Engineer", "Solution Sales Specialist", "Channel Sales Manager",
  // ── Finance & Accounting ──
  "Financial Analyst", "Financial Analysis", "Finance Manager",
  "Investment Analyst", "Investment Banking Analyst", "Investment Banking",
  "Chartered Accountant", "Cost Accountant", "Management Accountant",
  "Auditor", "Internal Auditor", "External Auditor",
  "Tax Consultant", "Tax Analyst", "Taxation",
  "CFO", "Finance Director", "Head of Finance",
  "Risk Analyst", "Risk Management", "Credit Analyst",
  "Compliance Officer", "Compliance Analyst", "Regulatory Affairs",
  "Financial Planner", "Wealth Manager", "Insurance Analyst",
  "Equity Research Analyst", "Fund Manager", "Portfolio Manager",
  // ── HR & Recruitment ──
  "HR Manager", "Human Resources Manager", "HR Business Partner",
  "Talent Acquisition Specialist", "Talent Acquisition", "Recruiter",
  "Technical Recruiter", "IT Recruiter", "Staffing Specialist",
  "HR Generalist", "HR Executive", "Payroll Manager",
  "Learning & Development Manager", "L&D Specialist", "Training Manager",
  "Employee Relations Manager", "Compensation & Benefits Analyst",
  "Operations Manager", "Operations Analyst", "Business Operations",
  // ── Supply Chain & Logistics ──
  "Supply Chain Manager", "Supply Chain Analyst", "Supply Chain",
  "Logistics Manager", "Logistics Coordinator", "Logistics Executive",
  "Procurement Manager", "Procurement Analyst", "Procurement Executive",
  "Inventory Manager", "Warehouse Manager", "Distribution Manager",
  "Import Export Manager", "Freight Coordinator", "Fleet Manager",
  // ── Healthcare & Life Sciences ──
  "Doctor", "General Physician", "Surgeon",
  "Nurse", "Staff Nurse", "Nursing Manager",
  "Pharmacist", "Clinical Pharmacist", "Medical Officer",
  "Medical Representative", "Pharmaceutical Sales", "Healthcare Sales",
  "Clinical Research Associate", "Clinical Research", "CRA",
  "Hospital Administrator", "Healthcare Administrator", "Hospital Management",
  "Healthcare Analyst", "Health Informatics", "Medical Coding",
  "Physiotherapist", "Radiologist", "Lab Technician",
  // ── Education & Training ──
  "Teacher", "School Teacher", "Primary Teacher",
  "Professor", "Lecturer", "Assistant Professor",
  "Instructional Designer", "Curriculum Developer", "E-learning Developer",
  "EdTech Developer", "Education Technology", "Online Tutor",
  "Academic Counselor", "Career Counselor", "Education Counselor",
  "Corporate Trainer", "Soft Skills Trainer", "Life Coach",
  // ── Legal & Compliance ──
  "Lawyer", "Advocate", "Corporate Lawyer",
  "Legal Advisor", "Legal Counsel", "In-House Counsel",
  "Paralegal", "Legal Assistant", "Contract Manager",
  "Compliance Manager", "Regulatory Compliance", "Legal Compliance",
  "Intellectual Property Analyst", "Patent Analyst",
  // ── Civil, Mechanical & Electrical Engineering ──
  "Civil Engineer", "Civil Engineering", "Site Engineer",
  "Structural Engineer", "Structural Engineering", "Geotechnical Engineer",
  "Mechanical Engineer", "Mechanical Engineering", "Manufacturing Engineer",
  "Electrical Engineer", "Electrical Engineering", "Power Systems Engineer",
  "Architect", "Architecture", "Urban Planner",
  "Interior Designer", "Interior Design", "Space Planner",
  "Construction Manager", "Construction Project Manager", "Site Supervisor",
  "AutoCAD Engineer", "CAD Designer", "BIM Engineer",
  "MEP Engineer", "HVAC Engineer", "Piping Engineer",
  // ── Customer Support ──
  "Customer Support Executive", "Customer Service Representative", "Customer Service",
  "Technical Support Engineer", "Help Desk Analyst", "IT Support",
  "Customer Success Manager", "Client Relationship Manager", "CRM Specialist",
  // ── Internships & Fresher Roles ──
  "Software Intern", "Software Engineering Intern", "Development Intern",
  "ML Intern", "AI Intern",
  "Marketing Intern", "Digital Marketing Intern", "Content Intern",
  "Finance Intern", "Accounting Intern", "HR Intern",
  "Design Intern", "UI UX Intern", "Research Intern",
  "Fresher Software Engineer", "Graduate Trainee", "Management Trainee",
  "Entry Level Developer", "Junior Developer", "Junior Data Analyst",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  url: string;
  source: string;
  postedAt: string;
  requiredExperienceMonths: number | null;
  experienceText: string | null; // e.g. "4+ years of experience in data analysis"
  isRemote: boolean | null;
}

interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  status: string;
  updatedAt: string;
}

type JobStatus = "saved" | "applied" | "interviewing" | "offer" | "rejected";

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  saved: "bg-gray-100 text-gray-700",
  applied: "bg-blue-100 text-blue-700",
  interviewing: "bg-yellow-100 text-yellow-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// ─── Experience Extractor ────────────────────────────────────────────────────

function extractExperience(job: {
  requiredExperienceMonths: number | null;
  experienceText: string | null;
  description: string;
}): string {
  // Priority 1: clean string already extracted from job_highlights.Qualifications
  if (job.experienceText) {
    const t = job.experienceText.trim();
    if (t.toLowerCase() === "fresher / no experience required") return "Fresher";
    return t;
  }

  // Priority 2: numeric months from job_required_experience
  if (job.requiredExperienceMonths !== null) {
    if (job.requiredExperienceMonths === 0) return "Fresher";
    const yrs = Math.round(job.requiredExperienceMonths / 12);
    return `${yrs} year${yrs > 1 ? "s" : ""}`;
  }

  // Priority 3: regex parse the description
  const desc = job.description.toLowerCase();

  // Patterns that indicate "preferred" or "optional" — we skip when a required one exists later
  const preferredRe = /preferred|optional|nice[- ]to[- ]have|bonus/i;

  // Try to find ALL experience mentions and pick the first non-preferred one
  const patterns: { re: RegExp; fmt: (m: RegExpMatchArray) => string }[] = [
    // Range: 2-4 years  /  2 to 4 years
    {
      re: /(\d+)\s*[-–to]+\s*(\d+)\+?\s*years?(?:\s+of)?(?:\s+(?:relevant\s+)?(?:work\s+)?experience)?/i,
      fmt: (m) => `${m[1]}-${m[2]} years`,
    },
    // Minimum / at least: minimum 5 years / at least 3 years
    {
      re: /(?:minimum|at\s+least|min\.?)\s+(\d+)\+?\s*years?(?:\s+of)?(?:\s+(?:relevant\s+)?(?:work\s+)?experience)?/i,
      fmt: (m) => `${m[1]}+ years`,
    },
    // X+ years
    {
      re: /(\d+)\+\s*years?(?:\s+of)?(?:\s+(?:relevant\s+)?(?:work\s+)?experience)?/i,
      fmt: (m) => `${m[1]}+ years`,
    },
    // X years of experience
    {
      re: /(\d+)\s*years?\s+of(?:\s+(?:relevant\s+)?(?:work\s+)?)?\s*experience/i,
      fmt: (m) => `${m[1]} year${Number(m[1]) > 1 ? "s" : ""}`,
    },
    // X years experience
    {
      re: /(\d+)\s*years?\s+(?:relevant\s+)?(?:work\s+)?experience/i,
      fmt: (m) => `${m[1]} year${Number(m[1]) > 1 ? "s" : ""}`,
    },
    // experience of X years
    {
      re: /experience\s+of\s+(\d+)\+?\s*years?/i,
      fmt: (m) => `${m[1]}+ years`,
    },
  ];

  // Split description into sentences and find first non-preferred mention
  const sentences = job.description.split(/[.!?\n]/);
  for (const pat of patterns) {
    for (const sentence of sentences) {
      const m = sentence.match(pat.re);
      if (m) {
        // Skip if this sentence is marked as preferred/optional and there might be a required one
        const isPreferred = preferredRe.test(sentence);
        if (!isPreferred) return pat.fmt(m);
      }
    }
    // If all mentions are preferred, still use the first one found (better than nothing)
    for (const sentence of sentences) {
      const m = sentence.match(pat.re);
      if (m) return pat.fmt(m);
    }
  }

  // Fresher keyword
  if (/fresh(?:er)?|entry[- ]level|no experience required/i.test(desc)) return "Fresher";

  return "Not specified";
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobHuntingPage() {
  const [tab, setTab] = useState<"discover" | "saved">("discover");

  // ── Discover tab state ──
  const [query, setQuery] = useState("");
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const jobInputRef = useRef<HTMLDivElement>(null);
  const [experience, setExperience] = useState("0");
  const [workMode, setWorkMode] = useState("");
  const [country, setCountry] = useState("India");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);
  const [discoverError, setDiscoverError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastQueryRef = useRef("");
  const lastLocationRef = useRef("");
  const lastExperienceRef = useRef("");

  // Experience options: 0 = Fresher, 1–30 years
  const EXPERIENCE_OPTIONS = [
    { value: "0", label: "Fresher" },
    ...Array.from({ length: 30 }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1} year${i + 1 > 1 ? "s" : ""}`,
    })),
  ];

  // Build experience keyword to append to query
  const experienceQuery =
    experience === "" ? "" :
      experience === "0" ? "fresher entry level" :
        `${experience} year${Number(experience) > 1 ? "s" : ""}`;

  // Work mode options
  const WORK_MODE_OPTIONS = [
    { value: "", label: "Any Work Mode" },
    { value: "remote", label: " Remote" },
    { value: "onsite", label: " On-site" },
    { value: "hybrid", label: " Hybrid" },
    { value: "fulltime", label: " Full-time" },
    { value: "parttime", label: " Part-time" },
    { value: "contract", label: " Contract" },
    { value: "internship", label: " Internship" },
  ];

  // Work mode keyword map (appended to the API search query)
  const WORK_MODE_KEYWORDS: Record<string, string> = {
    remote: "remote",
    onsite: "on-site",
    hybrid: "hybrid",
    fulltime: "full-time",
    parttime: "part-time",
    contract: "contract",
    internship: "internship",
  };


  // Helper: format experience for display on card
  const formatExp = (months: number | null): string => {
    if (months === null) return "";
    if (months === 0) return "Fresher";
    const yrs = Math.round(months / 12);
    return `${yrs} yr${yrs > 1 ? "s" : ""} exp required`;
  };

  // Client-side filter: experience + work mode
  const filteredDiscoveredJobs = discoveredJobs.filter((job) => {
    // ─ Experience filter ─
    if (experience !== "") {
      if (job.requiredExperienceMonths !== null) {
        if (experience === "0" && job.requiredExperienceMonths > 12) return false;
        if (experience !== "0" && job.requiredExperienceMonths > Number(experience) * 12) return false;
      }
    }
    // ─ Work mode filter ─
    if (workMode !== "") {
      if (workMode === "remote") {
        // only show if explicitly remote
        if (job.isRemote === false) return false;
      } else if (workMode === "onsite") {
        if (job.isRemote === true) return false;
      } else if (workMode === "hybrid") {
        // hybrid: not purely remote, not purely on-site — match by type keyword
        const typeStr = (job.type ?? "").toLowerCase();
        if (!typeStr.includes("hybrid") && job.isRemote !== null) return false;
      } else {
        // fulltime / parttime / contract / internship — match job.type
        const typeKeyword = WORK_MODE_KEYWORDS[workMode] ?? "";
        const typeStr = (job.type ?? "").toLowerCase();
        if (typeKeyword && !typeStr.includes(typeKeyword.replace("-", "").replace("-", ""))) return false;
      }
    }
    return true;
  });
  // Close job dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (jobInputRef.current && !jobInputRef.current.contains(e.target as Node)) {
        setJobDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtered job titles — only show dropdown when user has typed something
  const filteredTitles = query.trim()
    ? JOB_TITLES.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : [];

  // ── My Applications tab state ──
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Load saved jobs ──
  const loadSavedJobs = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch("/api/jobs/saved");
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.jobs ?? []);
        setSavedIds(new Set((data.jobs ?? []).map((j: SavedJob) => j.jobId)));
      }
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  // ── Derived location lists ──
  const countries = getCountries();
  const states = getStates(country);
  const cities = getCities(country, selectedState);

  // Build location string from selections
  const locationString = [city, selectedState, country].filter(Boolean).join(", ");


  // ── Search jobs (fresh search, resets page) ──
  const searchJobs = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setDiscoverError("");
    setDiscovering(true);
    setCurrentPage(1);
    const baseQ = query || "software engineer";
    const expPart = experienceQuery ? ` ${experienceQuery}` : "";
    const modePart = workMode ? ` ${WORK_MODE_KEYWORDS[workMode] ?? ""}` : "";
    const q = `${baseQ}${expPart}${modePart}`;
    const loc = locationString || "India";
    lastQueryRef.current = q;
    lastLocationRef.current = loc;
    lastExperienceRef.current = experienceQuery;
    try {
      const params = new URLSearchParams({ query: q, location: loc, page: "1" });
      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setDiscoverError(data.error || "Failed to fetch jobs.");
        return;
      }
      const jobs = data.jobs ?? [];
      setDiscoveredJobs(jobs);
      setHasMore(jobs.length >= 10);
    } catch {
      setDiscoverError("Network error. Please try again.");
    } finally {
      setDiscovering(false);
    }
  };

  // ── Load more jobs (next page, appends to existing list) ──
  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const params = new URLSearchParams({
        query: lastQueryRef.current,
        location: lastLocationRef.current,
        page: String(nextPage),
      });
      const res = await fetch(`/api/jobs/search?${params}`);
      const data = await res.json();
      if (!res.ok) return;
      const newJobs: DiscoveredJob[] = data.jobs ?? [];
      setDiscoveredJobs((prev) => {
        // deduplicate by id
        const existingIds = new Set(prev.map((j) => j.id));
        const unique = newJobs.filter((j) => !existingIds.has(j.id));
        return [...prev, ...unique];
      });
      setCurrentPage(nextPage);
      setHasMore(newJobs.length >= 10);
    } catch {
      // silently fail load more
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Save a discovered job ──
  const saveJob = async (job: DiscoveredJob) => {
    setSavingId(job.id);
    try {
      const res = await fetch("/api/jobs/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          source: job.source,
        }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set([...prev, job.id]));
        await loadSavedJobs();
      }
    } finally {
      setSavingId(null);
    }
  };

  // ── Update job status ──
  const updateStatus = async (id: string, status: JobStatus) => {
    setUpdatingId(id);
    try {
      await fetch("/api/jobs/saved", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setSavedJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status } : j))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete a saved job ──
  const deleteJob = async (id: string) => {
    await fetch(`/api/jobs/saved?id=${id}`, { method: "DELETE" });
    setSavedJobs((prev) => prev.filter((j) => j.id !== id));
  };

  // ── Stats ──
  const stats = {
    saved: savedJobs.filter((j) => j.status === "saved").length,
    applied: savedJobs.filter((j) => j.status === "applied").length,
    interviewing: savedJobs.filter((j) => j.status === "interviewing").length,
    offer: savedJobs.filter((j) => j.status === "offer").length,
  };

  return (
    <PageShell
      title="Job Hunting"
      description="Search real jobs from Naukri, LinkedIn, Indeed and more. Track your applications."
      maxWidth="xl"
    >
      {/* Stats bar */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Saved", value: stats.saved },
          { label: "Applied", value: stats.applied },
          { label: "Interviewing", value: stats.interviewing },
          { label: "Offers", value: stats.offer },
        ].map(({ label, value }) => (
          <Card key={label} padding="md">
            <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
          </Card>
        ))}
      </section>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-[var(--color-border)]">
        {(["discover", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t
              ? "border-b-2 border-[var(--color-primary-600)] text-[var(--color-primary-600)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
          >
            {t === "discover" ? "🔍 Discover Jobs" : `📋 My Applications (${savedJobs.length})`}
          </button>
        ))}
      </div>

      {/* ── DISCOVER TAB ── */}
      {tab === "discover" && (
        <div className="space-y-6">
          {/* Search form */}
          <Card padding="md">
            <form onSubmit={searchJobs} className="space-y-4">
              {/* Row 1: Job title searchable dropdown */}
              <div ref={jobInputRef} className="relative">
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Job title or keywords
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setJobDropdownOpen(e.target.value.trim().length > 0); }}
                  onFocus={() => { if (query.trim().length > 0) setJobDropdownOpen(true); }}
                  placeholder="e.g. Software Engineer, Data Analyst"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                />
                {jobDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-60 overflow-y-auto">
                    {/* Custom query option if typed something not in list */}
                    {query.trim() && !JOB_TITLES.some((t) => t.toLowerCase() === query.toLowerCase()) && (
                      <button
                        type="button"
                        onMouseDown={() => { setJobDropdownOpen(false); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)] border-b border-[var(--color-border)]"
                      >
                        <span>🔍</span>
                        <span>Search for &ldquo;<strong>{query}</strong>&rdquo;</span>
                      </button>
                    )}
                    {filteredTitles.length > 0 ? (
                      filteredTitles.map((title, idx) => (
                        <button
                          key={`${idx}-${title}`}
                          type="button"
                          onMouseDown={() => { setQuery(title); setJobDropdownOpen(false); }}
                          className="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] transition-colors"
                        >
                          {title}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-sm text-[var(--color-text-muted)]">No matches — press Search to use your query.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Row 1.5: Experience dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Mode dropdown */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                >
                  {WORK_MODE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Row 2: Location dropdowns */}
              <div className="flex flex-wrap gap-3">
                {/* Country */}
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setSelectedState("");
                      setCity("");
                    }}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    State / Region
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setCity(""); }}
                    disabled={!country}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                  >
                    <option value="">All states</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!selectedState}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                  >
                    <option value="">All cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location preview + Search button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {locationString && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    📍 Searching in: <span className="font-medium text-[var(--color-text)]">{locationString}</span>
                  </p>
                )}
                <Button type="submit" variant="primary" loading={discovering}>
                  Search Jobs
                </Button>
              </div>
            </form>
          </Card>

          {discoverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {discoverError}
              {discoverError.includes("RAPIDAPI_KEY") && (
                <p className="mt-1 font-medium">
                  Add <code className="rounded bg-red-100 px-1">RAPIDAPI_KEY=your_key</code> to your{" "}
                  <code>.env.local</code> file.
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {discoveredJobs.length === 0 && !discovering && !discoverError && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <p className="text-2xl">🔍</p>
              <p className="mt-2 font-medium text-[var(--color-text)]">Search for jobs above</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Results are pulled live from Naukri, LinkedIn, Indeed, and more.
              </p>
            </div>
          )}

          {discovering && (
            <div className="py-16 text-center text-[var(--color-text-muted)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
              Fetching live jobs…
            </div>
          )}

          {/* Results count */}
          {filteredDiscoveredJobs.length > 0 && !discovering && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing <span className="font-medium text-[var(--color-text)]">{filteredDiscoveredJobs.length}</span>
              {filteredDiscoveredJobs.length !== discoveredJobs.length && (
                <span> (filtered from {discoveredJobs.length})</span>
              )} jobs
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDiscoveredJobs.map((job) => (
              <Card key={job.id} padding="md" className="flex flex-col gap-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[var(--color-text)] leading-snug">{job.title}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--color-primary-50)] px-2 py-0.5 text-xs text-[var(--color-primary-600)]">
                      {job.source}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{job.company}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{job.location}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {job.type && (
                      <span className="rounded-full bg-[var(--color-surface-alt,#f3f4f6)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">{job.type}</span>
                    )}
                    {job.isRemote === true && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">🌐 Remote</span>
                    )}
                    {job.isRemote === false && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">🏢 On-site</span>
                    )}
                  </div>
                </div>

                {/* Experience — extracted intelligently */}
                <p className="text-xs text-[var(--color-text-muted)]">
                  <span className="font-medium text-[var(--color-text)]">Years of experience needed: </span>
                  {extractExperience(job)}
                </p>

                <p className="text-xs text-[var(--color-text-muted)] line-clamp-3">{job.description}</p>

                <div className="mt-auto flex gap-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-700)]"
                  >
                    View job
                  </a>
                  <button
                    onClick={() => saveJob(job)}
                    disabled={savedIds.has(job.id) || savingId === job.id}
                    className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${savedIds.has(job.id)
                      ? "border-green-300 bg-green-50 text-green-700 cursor-default"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-600)]"
                      }`}
                  >
                    {savingId === job.id ? "Saving…" : savedIds.has(job.id) ? "✓ Saved" : "Save"}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {discoveredJobs.length > 0 && hasMore && !discovering && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary-400)] hover:text-[var(--color-primary-600)] transition-colors disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
                    Loading more…
                  </>
                ) : (
                  "Load More Jobs →"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MY APPLICATIONS TAB ── */}
      {tab === "saved" && (
        <div className="space-y-4">
          {loadingSaved && (
            <div className="py-12 text-center text-[var(--color-text-muted)]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)]" />
              Loading your applications…
            </div>
          )}

          {!loadingSaved && savedJobs.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
              <p className="text-2xl">📋</p>
              <p className="mt-2 font-medium text-[var(--color-text)]">No saved jobs yet</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Search for jobs and click "Save" to track them here.
              </p>
              <button
                onClick={() => setTab("discover")}
                className="mt-4 text-sm font-medium text-[var(--color-primary-600)] hover:underline"
              >
                Go to Discover →
              </button>
            </div>
          )}

          {savedJobs.map((job) => (
            <Card key={job.id} padding="md">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--color-text)]">{job.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">{job.company}</p>
                  {job.location && (
                    <p className="text-xs text-[var(--color-text-muted)]">{job.location}</p>
                  )}
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Via {job.source} · Updated {new Date(job.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status selector */}
                  <select
                    value={job.status}
                    disabled={updatingId === job.id}
                    onChange={(e) => updateStatus(job.id, e.target.value as JobStatus)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-700)]"
                  >
                    View job
                  </a>
                  <button
                    onClick={() => deleteJob(job.id)}
                    title="Remove"
                    className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
