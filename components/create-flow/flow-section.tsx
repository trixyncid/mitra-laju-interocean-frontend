import { IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export type FlowStepState = "done" | "todo" | "optional"

const STATE_CHIP: Record<FlowStepState, { label: string; className: string }> = {
  done: {
    label: "Done",
    className: "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
  },
  todo: {
    label: "Required",
    className: "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]",
  },
  optional: {
    label: "Optional",
    className: "bg-muted text-muted-foreground",
  },
}

/** The round step number; turns into a check once the step is complete. */
export function StepBadge({
  step,
  state,
  className,
}: {
  step: number
  state: FlowStepState
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors",
        state === "done"
          ? "brand-fill text-primary-foreground"
          : "bg-card text-foreground ring-1 ring-border",
        className
      )}
    >
      {state === "done" ? <IconCheck className="size-4" stroke={2.5} /> : step}
    </span>
  )
}

/** One numbered card of a create flow. `id` is the anchor the step rail links to. */
export function FlowSection({
  id,
  step,
  title,
  hint,
  state,
  meta,
  children,
  className,
}: {
  id: string
  step: number
  title: string
  hint?: string
  state: FlowStepState
  /** Short extra text next to the state chip, e.g. "2 of 4 added". */
  meta?: string
  children: React.ReactNode
  className?: string
}) {
  const chip = STATE_CHIP[state]
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-28 rounded-xl surface p-5 sm:p-6 lg:p-7", className)}
    >
      <header className="mb-5 flex items-start gap-3">
        <StepBadge step={step} state={state} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", chip.className)}>
              {chip.label}
            </span>
            {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
          </div>
          {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
        </div>
      </header>
      {children}
    </section>
  )
}
