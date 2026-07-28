"use client"

import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type DeleteConfirmButtonProps = {
  isPending: boolean
  onClick: () => void
  idleLabel?: string
  pendingLabel?: string
  className?: string
  disabled?: boolean
}

/**
 * Destructive confirm action with an explicit pending state.
 * Use inside delete / deactivate dialogs so users get clear feedback.
 */
export function DeleteConfirmButton({
  isPending,
  onClick,
  idleLabel = "Delete",
  pendingLabel = "Deleting...",
  className,
  disabled = false,
}: DeleteConfirmButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled || isPending}
      aria-busy={isPending}
      className={cn("min-w-28", className)}
      onClick={onClick}
    >
      {isPending ? (
        <>
          <Loader2Icon className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  )
}
