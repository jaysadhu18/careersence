"use client";

import { Card } from "@/components/ui/Card";

export interface QuizOption {
  value: string;
  label: string;
}

interface QuizQuestionCardProps {
  question: string;
  options: QuizOption[];
  value?: string;
  onChange: (value: string) => void;
  type?: "single" | "multiple" | "likert";
  likertLabels?: [string, string];
}

export function QuizQuestionCard({
  question,
  options,
  value,
  onChange,
  type = "single",
  likertLabels = ["Strongly disagree", "Strongly agree"],
}: QuizQuestionCardProps) {
  if (type === "likert") {
    return (
      <Card padding="lg">
        <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
          {question}
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-[var(--color-text-muted)]">
            {likertLabels[0]}
          </span>
          <div className="flex flex-1 flex-wrap justify-center gap-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="cursor-pointer rounded-lg border px-3 py-2 text-sm has-[:checked]:border-[var(--color-primary-600)] has-[:checked]:bg-[var(--color-primary-50)]"
              >
                <input
                  type="radio"
                  name={question.slice(0, 20)}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <span className="text-sm text-[var(--color-text-muted)]">
            {likertLabels[1]}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h3 className="mb-4 text-lg font-medium text-[var(--color-text)]">
        {question}
      </h3>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3 transition-colors has-[:checked]:border-[var(--color-primary-600)] has-[:checked]:bg-[var(--color-primary-50)]"
          >
            <input
              type={type === "multiple" ? "checkbox" : "radio"}
              name={question.slice(0, 20)}
              value={opt.value}
              checked={type === "multiple" ? value?.includes(opt.value) : value === opt.value}
              onChange={() =>
                onChange(
                  type === "multiple"
                    ? value?.includes(opt.value)
                      ? (value ?? "").replace(opt.value, "").replace(/\s*,\s*/, "")
                      : [value, opt.value].filter(Boolean).join(",")
                    : opt.value
                )
              }
              className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary-600)]"
            />
            <span className="text-[var(--color-text)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
