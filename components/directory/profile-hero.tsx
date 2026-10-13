"use client"

import Link from "next/link"
import type { ComponentType, ReactNode } from "react"
import { IconArrowLeft } from "@tabler/icons-react"

import { Monogram } from "@/components/directory/primitives"
import { cn } from "@/lib/utils"

/**
 * Header for a customer or vendor page: a coloured band, a big monogram that
 * overlaps it, the name and its key facts. `tone` keeps the two record kinds
 * visibly different.
 */
export function ProfileHero({
  tone,
  backHref,
  backLabel,
  name,
  code,
  badges,
  facts,
  actions,
  aside,
  children,
}: {
  tone: "client" | "supplier"
  backHref: string
  backLabel: string
  name: string
  code: string
  badges?: ReactNode
  facts?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl surface">
      <div
        className={cn(
          "relative h-28 overflow-hidden sm:h-32",
          tone === "client"
            ? "bg-[image:var(--mli-gradient-brand)]"
            : "bg-[linear-gradient(120deg,#0f2f57_0%,#14456f_55%,#135c55_100%)]"
        )}
      >
        <HeroPattern tone={tone} />
        <Link
          href={backHref}
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:left-6"
        >
          <IconArrowLeft className="size-3.5" />
          {backLabel}
        </Link>
        {actions ? (
          <div className="absolute top-3.5 right-4 flex items-center gap-2 sm:right-6">{actions}</div>
        ) : null}
      </div>

      <div className="relative px-4 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <Monogram
              name={name}
              shape={tone === "client" ? "circle" : "square"}
              className={cn(
                "-mt-10 size-20 text-2xl ring-4 ring-card shadow-elev-2 sm:-mt-12 sm:size-24 sm:text-3xl",
                tone === "supplier" && "rounded-2xl"
              )}
            />
            <div className="min-w-0 space-y-2 sm:pt-4 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-headline-lg break-words">{name}</h1>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                  {code}
                </span>
              </div>
              {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
              {facts ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {facts}
                </div>
              ) : null}
            </div>
          </div>
          {/* The aside floats up into the band, like the monogram. */}
          {aside ? <div className="relative lg:-mt-14 lg:min-w-[22rem] lg:self-start">{aside}</div> : null}
        </div>

        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  )
}

export function HeroFact({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  )
}

function HeroPattern({ tone }: { tone: "client" | "supplier" }) {
  if (tone === "client") {
    // Gentle sea waves for clients.
    return (
      <svg aria-hidden className="absolute inset-0 size-full opacity-25" preserveAspectRatio="none">
        <defs>
          <pattern id="hero-waves" width="120" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M0 12c15 0 15-8 30-8s15 8 30 8 15-8 30-8 15 8 30 8"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-waves)" />
      </svg>
    )
  }
  // Stacked container blocks for suppliers.
  return (
    <svg aria-hidden className="absolute inset-0 size-full opacity-20" preserveAspectRatio="none">
      <defs>
        <pattern id="hero-crates" width="56" height="28" patternUnits="userSpaceOnUse">
          <rect x="2" y="4" width="24" height="10" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
          <rect x="30" y="16" width="24" height="10" rx="1.5" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-crates)" />
    </svg>
  )
}

/** A KPI inside the hero. */
export function HeroStat({
  label,
  value,
  hint,
  icon: Icon,
  className,
  children,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ComponentType<{ className?: string }>
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={cn("rounded-2xl surface-inset p-4", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-card text-primary shadow-elev-1">
          <Icon className="size-3.5" />
        </span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground break-words">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  )
}

/** A stacked bar that shows how a total splits into parts. */
export function MixBar({
  parts,
}: {
  parts: { key: string; label: string; value: number; className: string }[]
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  return (
    <div className="mt-3 space-y-2">
      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {total > 0
          ? parts
              .filter((part) => part.value > 0)
              .map((part) => (
                <span
                  key={part.key}
                  title={`${part.label}: ${part.value}`}
                  className={cn("h-full first:rounded-l-full last:rounded-r-full", part.className)}
                  style={{ width: `${(part.value / total) * 100}%` }}
                />
              ))
          : null}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {parts.map((part) => (
          <li key={part.key} className="inline-flex items-center gap-1">
            <span className={cn("size-2 rounded-full", part.className)} />
            {part.label} <span className="font-medium text-foreground tabular-nums">{part.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
