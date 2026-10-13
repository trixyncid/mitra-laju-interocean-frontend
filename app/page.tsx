"use client"

import Image from "next/image"
import { motion } from "motion/react"

import { SupportedByTrixync } from "@/components/brand/trixync-mark"
import { LoginForm } from "@/components/forms/login-form"
import { useGuestOnly } from "@/hooks/use-auth-redirect"
import { Button } from "@/components/ui/button"
import backgroundImage from "@/public/images/login-background.png"

const easeOut = [0.22, 1, 0.36, 1] as const

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-full brand-fill">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path
            d="M3 15.5c2 0 2-1.5 4.5-1.5S9.5 15.5 12 15.5s2.5-1.5 4.5-1.5 2.5 1.5 4.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 19.5c2 0 2-1.5 4.5-1.5S9.5 19.5 12 19.5s2.5-1.5 4.5-1.5 2.5 1.5 4.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path d="M7 11.5 12 4l5 7.5H7Z" fill="currentColor" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
          Mitra Laju
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Interocean</span>
      </span>
    </div>
  )
}

export default function LoginPage() {
  const { isPending, isRedirecting, error } = useGuestOnly()

  if (isPending || isRedirecting) {
    return <div className="min-h-svh bg-background" />
  }

  return (
    <div className="flex min-h-svh bg-background p-3 sm:p-4">
      <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Form panel */}
        <div className="flex flex-col justify-between rounded-2xl surface px-6 py-8 sm:px-12 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            <Brand />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            className="mx-auto w-full max-w-[400px] py-12"
          >
            <p className="text-xl text-foreground">Hello,</p>
            <h1 className="mt-1 text-[44px] font-medium leading-[1.05] tracking-[-0.035em] text-foreground">
              Welcome back
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Sign in to manage shipments, partners and finance across your freight network.
            </p>

            {error ? (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <p className="font-medium">Could not verify your session</p>
                <p className="mt-1 text-destructive/90">
                  {error.message || "The server may be unreachable. You can still sign in below."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <LoginForm variant="glass" className="mt-8" />
          </motion.div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Mitra Laju Interocean · Authorized personnel only
            </span>
            {/* On large screens the credit sits on the photo instead. */}
            <SupportedByTrixync className="-mx-2.5 lg:hidden" />
          </div>
        </div>

        {/* Imagery panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="relative hidden overflow-hidden rounded-2xl lg:block"
        >
          <Image
            src={backgroundImage}
            alt="Container vessel at port during golden hour"
            fill
            priority
            sizes="55vw"
            className="object-cover object-center"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <SupportedByTrixync variant="glass" className="absolute right-6 top-6" />
          <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-6">
            <p className="max-w-md text-[32px] font-medium leading-[1.15] tracking-[-0.03em] text-white">
              Move cargo with clarity and control.
            </p>
            <div className="flex shrink-0 gap-2">
              {["Shipments", "Voyages", "Finance"].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
