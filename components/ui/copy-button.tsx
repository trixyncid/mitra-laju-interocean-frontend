"use client"

import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { toast } from "sonner"

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async (event) => {
        event.stopPropagation()
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          toast.success(`${label} copied`)
          window.setTimeout(() => setCopied(false), 1500)
        } catch {
          toast.error("Couldn't copy to clipboard")
        }
      }}
      className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <IconCheck className="size-3.5 text-[var(--mli-positive)]" /> : <IconCopy className="size-3.5" />}
    </button>
  )
}
