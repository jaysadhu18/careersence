import Link from "next/link";

const features = [
  {
    title: "Career Quiz",
    description: "Answer a few questions and get personalized career cluster recommendations.",
    href: "/career-quiz",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "AI Roadmap",
    description: "A step-by-step timeline from interests to interviews, with action items.",
    href: "/ai-roadmap",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    title: "Learning Resources",
    description: "Courses, articles, and videos curated by path and skill level.",
    href: "/learning-resources",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Job Hunting",
    description: "Track applications, save roles, and use AI to tailor resumes and cover letters.",
    href: "/job-hunting",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
  },
  {
    title: "College Finder",
    description: "Discover and compare programs that match your goals.",
    href: "/college-finder",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    title: "Analyze",
    description: "Get AI feedback on your resume, job descriptions, and career comparisons.",
    href: "/analyze",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="bg-[var(--color-background)]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2" aria-hidden="true">
          <div className="h-[600px] w-[900px] rounded-full bg-gradient-to-tr from-[var(--color-primary-400)] to-[var(--color-secondary-400)] opacity-[0.12] blur-3xl" />
        </div>
        <div className="pointer-events-none absolute -bottom-24 right-0 -z-10" aria-hidden="true">
          <div className="h-[400px] w-[400px] rounded-full bg-[var(--color-primary-500)] opacity-[0.08] blur-3xl" />
        </div>

        <div className="px-6 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-medium tracking-wide text-[var(--color-text-muted)] uppercase">
              AI-Powered Career Guidance
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              Your career path,{" "}
              <span className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent">
                clarified
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-muted)]">
              Discover careers that fit you, build a step-by-step roadmap, and
              land the right role — all powered by AI.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-[var(--color-primary-600)] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--color-primary-600)]/25 transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-700)] hover:shadow-xl"
              >
                Get started free
              </Link>
              <Link
                href="/career-quiz"
                className="rounded-xl border-2 border-[var(--color-primary-600)] bg-transparent px-8 py-3.5 text-base font-semibold text-[var(--color-primary-600)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-50)]"
              >
                Take the career quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-20 sm:py-24">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Everything you need to move forward
            </h2>
            <p className="mt-3 text-[var(--color-text-muted)]">
              From discovery to job search — one cohesive platform.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-7 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary-400)] hover:shadow-[var(--shadow-lg)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] transition-colors group-hover:bg-[var(--color-primary-600)] group-hover:text-white">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary-600)] opacity-0 transition-opacity group-hover:opacity-100">
                  Explore
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
