"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserAvatarUrl } from "@/hooks/use-user-avatar"
import { cn } from "@/lib/utils"

/** Soft tints so a wall of initials is easy to tell apart. */
const TINTS = [
  "bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)]",
  "bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]",
  "bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)]",
  "bg-[var(--mli-backup-container)] text-[var(--mli-on-backup-container)]",
  "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
]

export function tintFor(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return TINTS[hash % TINTS.length]
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : ""
  return (first + last).toUpperCase()
}

export function PersonAvatar({
  userId,
  name,
  hasImage = false,
  version,
  className,
  fallbackClassName,
}: {
  userId?: string
  name: string
  hasImage?: boolean
  version?: string
  className?: string
  fallbackClassName?: string
}) {
  const { data: url } = useUserAvatarUrl(userId, hasImage, version)

  return (
    <Avatar className={cn("size-11 rounded-full", className)}>
      {url ? <AvatarImage src={url} alt={name} className="rounded-full object-cover" /> : null}
      <AvatarFallback
        className={cn(
          "rounded-full text-sm font-semibold",
          tintFor(name || "?"),
          fallbackClassName
        )}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  )
}
