import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  title: string;
  description?: string;
  sidebar?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "",
};

export function PageShell({
  children,
  title,
  description,
  sidebar,
  maxWidth = "xl",
}: PageShellProps) {
  return (
    <div className="mx-auto w-full px-6 py-10 sm:px-8 lg:px-12">
      <div
        className={`mx-auto ${maxWidthClasses[maxWidth]} ${
          sidebar ? "flex gap-8 lg:flex-row" : ""
        }`}
      >
        {sidebar && (
          <aside
            className="shrink-0 lg:w-64"
            aria-label="Page sidebar"
          >
            {sidebar}
          </aside>
        )}
        <div className="min-w-0 flex-1">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
