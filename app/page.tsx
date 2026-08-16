"use client"

import Image from "next/image"
import { motion } from "motion/react"
import { Ship } from "lucide-react"

import { LoginForm } from "@/components/forms/login-form"
import { useGuestOnly } from "@/hooks/use-auth-redirect"
import backgroundImage from "@/public/images/login-background.png"

export default function LoginPage() {
  const { isPending, isRedirecting } = useGuestOnly()

  if (isPending || isRedirecting) {
    return <div className="min-h-svh bg-[#1b365d]" />
  }

  return (
    <div className="relative flex min-h-svh overflow-hidden bg-[#1b365d]">
      {/* Full-bleed port photography — cooled so it sits under brand navy */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 14, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={backgroundImage}
          alt="Container vessel at port during golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Cool navy wash — ~20% lighter opacity, mid navy tint */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[#1b365d]/45 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(27,54,93,0.74)_0%,rgba(46,71,111,0.58)_38%,rgba(50,95,158,0.44)_62%,rgba(27,54,93,0.56)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(110,158,247,0.14)_0%,transparent_55%)]"
      />

      <div className="relative z-10 flex w-full flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12 xl:px-24">
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur-md">
            <Ship className="size-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-white">
              Mitra Laju Interocean
            </span>
            <span className="text-[11px] font-medium tracking-[0.14em] text-white/50 uppercase">
              Freight Forwarding
            </span>
          </div>
        </motion.div>

        {/* Main composition */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-0">
          {/* Hero copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden max-w-lg text-left lg:block"
          >
            <p className="mb-4 text-[11px] font-semibold tracking-[0.22em] text-white/55 uppercase">
              Operations portal
            </p>
            <h1 className="text-[2.75rem] leading-[1.1] font-semibold tracking-[-0.03em] text-white xl:text-[3.25rem]">
              Move cargo with
              <span className="block text-white/70">clarity and control.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
              Sign in to manage shipments and partners across your
              freight network.
            </p>
          </motion.div>

          {/* Glass login panel */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            <div className="relative overflow-hidden rounded-lg border border-white/40 bg-[#f7f9fb]/88 p-7 shadow-[0_24px_64px_rgba(27,54,93,0.28)] backdrop-blur-2xl sm:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              />

              <div className="relative">
                <div className="mb-7 lg:hidden">
                  <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[#44474e] uppercase">
                    Operations portal
                  </p>
                  <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#191c1e]">
                    Welcome back
                  </h1>
                  <p className="mt-1.5 text-sm text-[#44474e]">
                    Sign in to continue to your dashboard.
                  </p>
                </div>

                <div className="mb-7 hidden lg:block">
                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#191c1e]">
                    Welcome back
                  </h2>
                  <p className="mt-1.5 text-sm text-[#44474e]">
                    Enter your credentials to access the dashboard.
                  </p>
                </div>

                <LoginForm variant="glass" />
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-white/40">
              Protected access · Authorized personnel only
            </p>
          </motion.div>
        </div>

        {/* Footer strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-between gap-4 text-[11px] tracking-wide text-white/35"
        >
          <span>© {new Date().getFullYear()} Mitra Laju Interocean</span>
          <span className="hidden sm:inline">Global logistics · Real-time ops</span>
        </motion.div>
      </div>
    </div>
  )
}
