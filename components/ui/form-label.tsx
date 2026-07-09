"use client"

import { Label } from "@/components/ui/label"
import { RequiredMark } from "@/components/ui/field"
import { cn } from "@/lib/utils"

export function FormLabel({
  required,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {required ? <RequiredMark /> : null}
    </Label>
  )
}
