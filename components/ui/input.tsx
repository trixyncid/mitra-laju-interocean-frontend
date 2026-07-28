import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-md border bg-card px-5 py-1 text-base text-foreground shadow-none outline-none transition-[color,background-color,border-color,box-shadow] duration-200",
    "placeholder:text-muted-foreground/80",
    "selection:bg-primary selection:text-primary-foreground",
    "caret-primary",
    "cursor-text",
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/20",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  ],
  {
    variants: {
      fieldSize: {
        default: "h-11",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      fieldSize: "default",
    },
  }
)

function Input({
  className,
  type,
  fieldSize = "default",
  ref,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    ref?: React.Ref<HTMLInputElement>
  }) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ fieldSize }),
        "border-border hover:border-input",
        className
      )}
      {...props}
    />
  )
}

export { Input, inputVariants }
