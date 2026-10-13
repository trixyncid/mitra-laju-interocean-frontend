import { cn } from "@/lib/utils"
import { StepBadge, type FlowStepState } from "@/components/create-flow/flow-section"

export type FlowStep = {
  id: string
  title: string
  /** One short line under the title, e.g. what is still missing. */
  detail: string
  state: FlowStepState
}

function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Required fields filled"
      className="h-1.5 overflow-hidden rounded-full bg-[rgba(var(--mli-inset-rgb),0.95)]"
    >
      <div
        className="h-full rounded-full bg-[image:var(--mli-gradient-brand)] bg-primary transition-[width] duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function readyText(done: number, total: number) {
  return done === total ? "Ready to save" : `${done} of ${total} required filled`
}

/** Vertical step list for wide screens. Each step jumps to its section. */
export function StepRail({
  steps,
  requiredDone,
  requiredTotal,
  currentId,
}: {
  steps: FlowStep[]
  requiredDone: number
  requiredTotal: number
  currentId: string | null
}) {
  return (
    <nav aria-label="Steps" className="rounded-xl surface p-4">
      <p className="text-xs font-medium text-muted-foreground">Your progress</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {readyText(requiredDone, requiredTotal)}
      </p>
      <div className="mt-3">
        <ProgressBar done={requiredDone} total={requiredTotal} />
      </div>
      <ol className="relative mt-5 space-y-1">
        {steps.map((step, index) => {
          const current = step.id === currentId
          return (
            <li key={step.id} className="relative">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-11 left-[1.45rem] h-[calc(100%-2.25rem)] w-px",
                    step.state === "done" ? "bg-primary/50" : "bg-border"
                  )}
                />
              ) : null}
              <a
                href={`#${step.id}`}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted",
                  current && "bg-[rgba(var(--mli-brand-rgb),0.08)]"
                )}
              >
                <StepBadge
                  step={index + 1}
                  state={step.state}
                  className={cn(current && step.state !== "done" && "ring-2 ring-primary")}
                />
                <span className="min-w-0 pt-0.5">
                  <span className="block text-sm font-medium text-foreground">{step.title}</span>
                  <span className="block text-xs text-muted-foreground">{step.detail}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Compact version for narrow screens: dots for each step and one progress bar. */
export function StepStrip({
  steps,
  requiredDone,
  requiredTotal,
}: {
  steps: FlowStep[]
  requiredDone: number
  requiredTotal: number
}) {
  return (
    <nav aria-label="Steps" className="rounded-xl surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">
          {readyText(requiredDone, requiredTotal)}
        </p>
        <ol className="flex items-center gap-1.5">
          {steps.map((step, index) => (
            <li key={step.id}>
              <a href={`#${step.id}`} aria-label={`Step ${index + 1}: ${step.title}`}>
                <StepBadge step={index + 1} state={step.state} className="size-7 text-xs" />
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-3">
        <ProgressBar done={requiredDone} total={requiredTotal} />
      </div>
    </nav>
  )
}
