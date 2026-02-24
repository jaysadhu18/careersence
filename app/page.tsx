import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-[var(--color-background)]">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            Your career path,{" "}
            <span className="text-[var(--color-primary-600)]">clarified</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-muted)]">
            AI-powered guidance for students and early-career professionals.
            Discover careers that fit you, build a roadmap, and land the right
            role.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--color-primary-600)] px-6 py-3 text-base font-medium text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-700)]"
            >
              Get started free
            </Link>
            <Link
              href="/career-quiz"
              className="rounded-lg border-2 border-[var(--color-primary-600)] bg-transparent px-6 py-3 text-base font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]"
            >
              Take the career quiz
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-[var(--color-text)]">
            Everything you need to move forward
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[var(--color-text-muted)]">
            From discovery to job search — one cohesive platform.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Career Quiz",
                description: "Answer a few questions and get personalized career cluster recommendations.",
                href: "/career-quiz",
              },
              {
                title: "AI Roadmap",
                description: "A step-by-step timeline from interests to interviews, with action items.",
                href: "/ai-roadmap",
              },
              {
                title: "Learning Resources",
                description: "Courses, articles, and videos curated by path and skill level.",
                href: "/learning-resources",
              },
              {
                title: "Job Hunting",
                description: "Track applications, save roles, and use AI to tailor resumes and cover letters.",
                href: "/job-hunting",
              },
              {
                title: "College Finder",
                description: "Discover and compare programs that match your goals.",
                href: "/college-finder",
              },
              {
                title: "Analyze",
                description: "Get AI feedback on your resume, job descriptions, and career comparisons.",
                href: "/analyze",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <h3 className="font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
