"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Ship } from "lucide-react"

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
      className="relative flex min-h-svh overflow-hidden bg-[#eef3f9]"
    >
      {/* Atmosphere — cool dawn over harbour, bridges login navy → dashboard light */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#d7e3f4_0%,#eef3f9_48%,#dfe8f4_100%)]" />
        <div className="absolute -left-32 top-[-10%] size-[34rem] rounded-full bg-[rgba(27,54,93,0.14)] blur-3xl" />
        <div className="absolute -right-24 top-[18%] size-[28rem] rounded-full bg-[rgba(50,95,158,0.16)] blur-3xl" />
        <div className="absolute bottom-[-12%] left-[28%] size-[26rem] rounded-full bg-[rgba(145,186,255,0.28)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(27,54,93,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(27,54,93,0.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at 50% 42%, black 18%, transparent 72%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(27,54,93,0.18)] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="flex flex-col items-center"
        >
          <div
            className="relative flex size-14 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#6e9ef7] via-[#325f9e] to-[#1b365d] ring-1 ring-[rgba(27,54,93,0.2)]"
            style={{
              boxShadow: "0 12px 28px rgba(27,54,93,0.22)",
            }}
          >
            <span className="relative z-10 text-base font-bold tracking-[0.06em] text-white">
              ML
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)]"
              animate={{ x: ["-120%", "120%"] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1.4,
              }}
            />
          </div>

          <p className="mt-5 text-[11px] font-semibold tracking-[0.18em] text-[var(--mli-primary-container)]/70 uppercase">
            Mitra Laju Interocean
          </p>
          <h1 className="mt-2 max-w-sm text-headline-md font-semibold tracking-tight text-[var(--mli-primary-container)] sm:text-[1.75rem] sm:leading-9">
            Preparing your dashboard
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Setting course for your workspace — permissions, routes, and
            operations coming into view.
          </p>
        </motion.div>

        {/* Voyage route */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
          className="mt-12 w-full max-w-sm"
          aria-hidden
        >
          <div className="relative h-16">
            <svg
              viewBox="0 0 320 64"
              className="absolute inset-0 h-full w-full"
              fill="none"
            >
              <path
                d="M8 40 C 72 18, 120 54, 160 36 S 248 12, 312 40"
                stroke="rgba(27,54,93,0.12)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <motion.path
                d="M8 40 C 72 18, 120 54, 160 36 S 248 12, 312 40"
                stroke="var(--mli-primary-container)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="8 10"
                initial={{ pathLength: 0, opacity: 0.35 }}
                animate={{ pathLength: 1, opacity: 0.7 }}
                transition={{
                  pathLength: { duration: 1.6, ease: easeOut },
                  opacity: { duration: 0.6 },
                }}
              />
              {[8, 160, 312].map((cx) => (
                <circle
                  key={cx}
                  cx={cx}
                  cy={cx === 160 ? 36 : 40}
                  r="3.5"
                  fill="rgba(247,249,251,0.95)"
                  stroke="rgba(27,54,93,0.35)"
                  strokeWidth="1.5"
                />
              ))}
            </svg>

            <motion.div
              className="absolute top-[18px] flex size-8 -translate-x-1/2 items-center justify-center rounded-md border border-[rgba(214,227,255,0.7)] bg-[rgba(247,249,251,0.92)] text-[var(--mli-primary-container)]"
              style={{
                boxShadow: "0 8px 20px rgba(27,54,93,0.12)",
              }}
              animate={{
                left: ["4%", "50%", "96%", "4%"],
                top: ["22px", "14px", "22px", "22px"],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Ship className="size-4" strokeWidth={1.75} />
            </motion.div>
          </div>
        </motion.div>

        {/* Status + progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.35, ease: easeOut }}
          className="mt-8 w-full max-w-xs"
        >
          <div className="relative h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={PREP_STEPS[stepIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: easeOut }}
                className="absolute inset-x-0 text-sm font-medium text-[var(--mli-primary-container)]"
              >
                {PREP_STEPS[stepIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-md bg-[rgba(27,54,93,0.1)]">
            <motion.div
              className="h-full w-1/3 rounded-md bg-[linear-gradient(90deg,#325f9e_0%,#6e9ef7_55%,#325f9e_100%)]"
              animate={{ x: ["-120%", "320%"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <p className="mt-4 text-xs tracking-wide text-muted-foreground">
            Freight forwarding workspace
          </p>
        </motion.div>
      </div>
    </div>
  )
}
