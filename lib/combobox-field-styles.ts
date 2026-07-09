import { cn } from "@/lib/utils"
import { inputVariants } from "@/components/ui/input"

export function comboboxFieldClassName(className?: string) {
  return cn(
    inputVariants({ fieldSize: "default" }),
    "w-full border-border bg-card p-0 pr-2 shadow-none hover:border-input",
    "[&_[data-slot=input-group-control]]:bg-transparent [&_[data-slot=input-group-control]]:px-5",
    "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20",
    "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
    className
  )
}

export function selectFieldClassName(className?: string) {
  return cn("w-full bg-card shadow-none hover:border-input", className)
}
