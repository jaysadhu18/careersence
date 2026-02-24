import { Progress, StepIndicator } from "@/components/ui/Progress";

interface ProgressHeaderProps {
  title: string;
  description?: string;
  progress?: number;
  step?: { current: number; total: number; label?: string };
}

export function ProgressHeader({
  title,
  description,
  progress,
  step,
}: ProgressHeaderProps) {
  return (
    <header className="mb-8">
      {step && (
        <StepIndicator
          current={step.current}
          total={step.total}
          label={step.label}
        />
      )}
      <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[var(--color-text-muted)]">{description}</p>
      )}
      {progress !== undefined && (
        <Progress value={progress} max={100} className="mt-4" showValue />
      )}
    </header>
  );
}
