"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Ship } from "lucide-react"

import { TrixyncWordmark } from "@/components/brand/trixync-mark"

const PREP_STEPS = [
  "Verifying your session",
  "Loading workspace access",
  "Charting today’s operations",
  "Almost alongside",
] as const

const easeOut = [0.22, 1, 0.36, 1] as const

export default function DashboardPrepLoading() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % PREP_STEPS.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="flex w-full max-w-md flex-col items-center rounded-2xl surface px-8 py-12 text-center"
      >
        <div className="relative flex size-16 items-center justify-center rounded-2xl brand-fill">
          <Ship className="size-7" strokeWidth={1.75} />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-primary"
            animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">Mitra Laju Interocean</p>
        <h1 className="mt-1 text-[28px] font-medium leading-9 tracking-[-0.025em] text-foreground">
          Preparing your dashboard
        </h1>

        <div className="relative mt-6 h-5 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={PREP_STEPS[stepIndex]}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="absolute inset-x-0 text-sm font-medium text-foreground/80"
            >
              {PREP_STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary"
            animate={{ x: ["-120%", "320%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
        className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground"
      >
        Supported by
        <TrixyncWordmark className="text-foreground/70" />
      </motion.p>
    </div>
  )
}
