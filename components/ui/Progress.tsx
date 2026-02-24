interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = true,
  className = "",
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex justify-between text-sm">
          {label && <span className="font-medium text-[var(--color-text)]">{label}</span>}
          {showValue && (
            <span className="text-[var(--color-text-muted)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StepIndicator({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--color-primary-600)]">
        Step {current} of {total}
      </span>
      {label && <span className="text-sm text-[var(--color-text-muted)]">— {label}</span>}
      <div className="ml-2 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < current ? "bg-[var(--color-primary-600)]" : "bg-[var(--color-border)]"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
