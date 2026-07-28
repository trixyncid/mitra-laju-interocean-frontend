import { cn } from "@/lib/utils"
import { chipBase, chipInfo } from "@/lib/design"
import { formatRoleLabel } from "@/lib/permissions"

export function RoleChip({ role, className }: { role: string; className?: string }) {
  const slugGuess = role.toLowerCase().replace(/\s+/g, "_")
  const styles =
    slugGuess === "superadmin" || role === "Superadmin"
      ? cn(chipBase, "bg-[var(--mli-primary-container)] text-primary-foreground", className)
      : slugGuess === "admin" || role === "Admin"
        ? chipInfo(className)
        : slugGuess === "viewer" || role === "Viewer"
          ? cn(chipBase, "bg-[rgba(232,238,246,0.85)] text-muted-foreground", className)
          : cn(chipBase, "bg-secondary/80 text-secondary-foreground", className)

  return <span className={styles}>{formatRoleLabel(role)}</span>
}
