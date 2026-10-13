import { IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export type CreateStep = {
  title: string
  hint: string
  done: boolean
  optional?: boolean
}

/** A checklist that ticks itself as the form is filled in. */
export function CreateSteps({ steps }: { steps: CreateStep[] }) {
  const doneCount = steps.filter((step) => step.done).length
  return (
    <div className="rounded-2xl surface p-5">
      <p className="text-xs font-medium text-muted-foreground">Your progress</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {doneCount} of {steps.length} done
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step.done ? "brand-fill text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {step.done ? <IconCheck className="size-3.5" /> : index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm font-medium", step.done ? "text-foreground" : "text-muted-foreground")}>
                {step.title}
                {step.optional ? <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span> : null}
              </p>
              <p className="text-xs text-muted-foreground">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
