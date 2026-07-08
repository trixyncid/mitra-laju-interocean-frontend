import { cn } from "@/lib/utils"
import { chipBase, chipInfo, chipWarning } from "@/lib/design"
import { formatRoleLabel, parseUserRole } from "@/lib/permissions"

export function RoleChip({ role, className }: { role: string; className?: string }) {
  const parsed = parseUserRole(role)
  const styles =
    parsed === "superadmin"
      ? chipWarning(className)
      : parsed === "admin"
        ? chipInfo(className)
        : parsed === "viewer"
          ? cn(chipBase, "bg-muted text-muted-foreground", className)
          : cn(chipBase, "bg-secondary/80 text-secondary-foreground", className)

  return <span className={styles}>{formatRoleLabel(role)}</span>
}
