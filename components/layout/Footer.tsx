import Link from "next/link";

const footerLinks = [
  { href: "/", label: "About" },
  { href: "/", label: "FAQ" },
  { href: "/", label: "Contact" },
  { href: "/", label: "Terms" },
  { href: "/", label: "Privacy" },
];

export function Footer() {
  return (
    <footer
      className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      role="contentinfo"
    >
      <div className="mx-auto px-6 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-lg font-semibold text-[var(--color-primary-600)] no-underline"
            >
              Careersence
            </Link>
            <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
              AI-powered career and education guidance for students and
              early-career professionals. Discover your path, build skills, and
              land the right role.
            </p>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Recommendations and insights are powered by AI to personalize your
              experience.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Product
            </h3>
            <ul className="mt-4 space-y-2" role="list">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/career-quiz"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  Career Quiz
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-roadmap"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  AI Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Legal &amp; support
            </h3>
            <ul className="mt-4 space-y-2" role="list">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} Careersence. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
