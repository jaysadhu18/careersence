import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

const endpoints = [
  {
    id: "careers",
    method: "GET",
    path: "/v1/careers",
    description: "List career clusters with metadata (salary ranges, skills, education).",
    params: [
      { name: "query", type: "string", in: "query", description: "Search term" },
      { name: "limit", type: "number", in: "query", description: "Max results (default 20)" },
    ],
    response: {
      careers: [{ id: "string", title: "string", summary: "string", salaryMin: "number", salaryMax: "number" }],
    },
    exampleReq: "GET https://api.careersence.io/v1/careers?query=software&limit=10",
    exampleRes: '{"careers":[{"id":"se","title":"Software Engineering","summary":"...","salaryMin":70000,"salaryMax":150000}]}',
  },
  {
    id: "resources",
    method: "POST",
    path: "/v1/resources/search",
    description: "Search learning resources by filters.",
    params: [
      { name: "body", type: "object", in: "body", description: "Search filters" },
    ],
    response: {
      resources: [{ id: "string", title: "string", type: "string", durationMinutes: "number" }],
    },
    exampleReq: "POST https://api.careersence.io/v1/resources/search\nContent-Type: application/json\n\n{\"type\":\"course\",\"level\":\"Beginner\"}",
    exampleRes: '{"resources":[{"id":"1","title":"Intro to Programming","type":"course","durationMinutes":600}]}',
  },
];

export default function APIDocPage() {
  return (
    <PageShell
      title="API Documentation"
      description="Developer-friendly reference for the Careersence public API."
      maxWidth="xl"
    >
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside
          className="sticky top-24 hidden lg:block"
          aria-label="API sections"
        >
          <nav className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Endpoints
            </h3>
            <ul className="space-y-1" role="list">
              {endpoints.map((ep) => (
                <li key={ep.id}>
                  <a
                    href={`#${ep.id}`}
                    className="block rounded px-2 py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {ep.method} {ep.path}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-12">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Overview
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Authenticate with an API key in the request header:{" "}
              <code className="rounded bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-xs">
                Authorization: Bearer YOUR_API_KEY
              </code>
              . Base URL:{" "}
              <code className="rounded bg-[var(--color-background)] px-1.5 py-0.5 font-mono text-xs">
                https://api.careersence.io
              </code>
              . We use semantic versioning for the path (e.g. /v1/).
            </p>
          </Card>

          {endpoints.map((ep) => (
            <section key={ep.id} id={ep.id} className="scroll-mt-24">
              <Card padding="lg">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      ep.method === "GET"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-[var(--color-text)]">
                    {ep.path}
                  </code>
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {ep.description}
                </p>
                <h4 className="mt-4 font-medium text-[var(--color-text)]">
                  Parameters
                </h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="py-2 font-medium">Name</th>
                        <th className="py-2 font-medium">Type</th>
                        <th className="py-2 font-medium">In</th>
                        <th className="py-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr
                          key={p.name}
                          className="border-b border-[var(--color-border)]"
                        >
                          <td className="py-2 font-mono">{p.name}</td>
                          <td className="py-2">{p.type}</td>
                          <td className="py-2">{p.in}</td>
                          <td className="py-2 text-[var(--color-text-muted)]">
                            {p.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 font-medium text-[var(--color-text)]">
                  Response schema
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-xs text-[var(--color-text)]">
                  {JSON.stringify(ep.response, null, 2)}
                </pre>
                <h4 className="mt-4 font-medium text-[var(--color-text)]">
                  Example request
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-xs text-[var(--color-text)] whitespace-pre-wrap">
                  {ep.exampleReq}
                </pre>
                <h4 className="mt-4 font-medium text-[var(--color-text)]">
                  Example response
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 font-mono text-xs text-[var(--color-text)]">
                  {ep.exampleRes}
                </pre>
              </Card>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function Card({
  children,
  padding = "md",
}: {
  children: React.ReactNode;
  padding?: "md" | "lg";
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] ${
        padding === "lg" ? "p-6" : "p-4"
      }`}
    >
      {children}
    </div>
  );
}
