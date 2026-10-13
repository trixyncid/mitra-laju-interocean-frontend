import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

const TRIXYNC_URL = "https://trixync.id"

/** Paints a single-colour SVG in `currentColor`, so one asset works on light, dark and photo backgrounds. */
function maskStyle(src: string): CSSProperties {
  const image = `url(${src})`
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  }
}

/** The TRIXYNC wordmark (783 × 67) in the current text colour. */
export function TrixyncWordmark({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Trixync"
      className={cn("inline-block aspect-[783/67] h-2.5 shrink-0 bg-current", className)}
      style={maskStyle("/brand/trixync/logo-text-white.svg")}
    />
  )
}

function TrixyncIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block aspect-[356/315] h-3.5 shrink-0 bg-current", className)}
      style={maskStyle("/brand/trixync/logo-icon-white.svg")}
    />
  )
}

/**
 * "Supported by TRIXYNC" credit, linking to trixync.id.
 * `subtle` sits in page footers; `glass` floats over photography.
 */
export function SupportedByTrixync({
  variant = "subtle",
  className,
}: {
  variant?: "subtle" | "glass"
  className?: string
}) {
  return (
    <a
      href={TRIXYNC_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Supported by Trixync (opens in a new tab)"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full outline-none transition-colors focus-visible:ring-[3px]",
        variant === "subtle" &&
          "px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground focus-visible:ring-ring/20",
        variant === "glass" &&
          "bg-black/25 px-3.5 py-2 text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-md hover:bg-black/35 hover:text-white focus-visible:ring-white/40",
        className
      )}
    >
      <span className="text-[11px] font-medium leading-none">Supported by</span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors",
          variant === "subtle" ? "text-foreground/80 group-hover:text-foreground" : "text-white"
        )}
      >
        <TrixyncIcon />
        <TrixyncWordmark />
      </span>
    </a>
  )
}
