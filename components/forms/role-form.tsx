"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form-label"
import { TextField } from "@/components/ui/text-field"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useCreateRole,
  useRoleModules,
  useUpdateRole,
} from "@/hooks/use-roles"
import type { Role, RolePermission } from "@/services/roles.service"
import {
  FINANCIAL_MODULES_ENABLED,
  isFinancialModule,
} from "@/lib/feature-flags"
import type { AppModule, ShipmentType } from "@/lib/permissions"
import { toast } from "sonner"

const SHIPMENT_TYPES: ShipmentType[] = ["EXPORT", "IMPORT", "DOMESTIC"]

function mergePermissions(
  modules: AppModule[],
  existing: RolePermission[] | undefined
): RolePermission[] {
  const map = new Map(existing?.map((p) => [p.module, p]))
  return modules.map((module) => {
    const row = map.get(module)
    return {
      module,
      canView: row?.canView ?? false,
      canCreate: row?.canCreate ?? false,
      canEdit: row?.canEdit ?? false,
      canDelete: row?.canDelete ?? false,
    }
  })
}

export default function RoleForm({
  mode,
  role,
}: {
  mode: "create" | "edit"
  role?: Role
}) {
  const router = useRouter()
  const { data: catalog, isLoading: modulesLoading } = useRoleModules()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()

  const modules = useMemo(
    () =>
      (catalog ?? [])
        .map((m) => m.key)
        .filter((key) => FINANCIAL_MODULES_ENABLED || !isFinancialModule(key)),
    [catalog]
  )
  const moduleLabels = useMemo(() => {
    const map = new Map<AppModule, string>()
    for (const item of catalog ?? []) map.set(item.key, item.label)
    return map
  }, [catalog])

  const [name, setName] = useState(role?.name ?? "")
  const [slug, setSlug] = useState(role?.slug ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [allowedShipmentTypes, setAllowedShipmentTypes] = useState<ShipmentType[]>(
    role?.allowedShipmentTypes ?? []
  )
  const [permissions, setPermissions] = useState<RolePermission[]>(() =>
    mergePermissions(
      [
        "DASHBOARD",
        "CUSTOMER",
        "VENDOR",
        "PORT",
        "VESSEL",
        "CONTAINER",
        "SHIPMENT",
        ...(FINANCIAL_MODULES_ENABLED ? (["COSTING", "SELLING"] as const) : []),
        "USER",
        "ROLE",
      ],
      role?.permissions
    )
  )

  // Sync permissions when catalog loads
  const resolvedPermissions = useMemo(() => {
    if (modules.length === 0) return permissions
    return mergePermissions(modules, permissions)
  }, [modules, permissions])

  const isSystem = role?.isSystem ?? false
  const isPending = createRole.isPending || updateRole.isPending

  function setFlag(
    module: AppModule,
    key: keyof Omit<RolePermission, "module" | "id">,
    value: boolean
  ) {
    setPermissions((prev) => {
      const base = mergePermissions(
        modules.length ? modules : prev.map((p) => p.module),
        prev
      )
      return base.map((row) =>
        row.module === module ? { ...row, [key]: value } : row
      )
    })
  }

  function toggleShipmentType(type: ShipmentType) {
    setAllowedShipmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Slug is required")
      return
    }

    const payloadPermissions = resolvedPermissions.filter(
      (p) => p.canView || p.canCreate || p.canEdit || p.canDelete
    )

    if (mode === "create") {
      createRole.mutate(
        {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          allowedShipmentTypes,
          permissions: payloadPermissions,
        },
        {
          onSuccess: (data) => router.push(`/dashboard/roles/${data.id}`),
        }
      )
      return
    }

    if (!role) return
    updateRole.mutate(
      {
        id: role.id,
        payload: isSystem
          ? {
              name: name.trim(),
              description: description.trim() || null,
            }
          : {
              name: name.trim(),
              slug: slug.trim(),
              description: description.trim() || null,
              allowedShipmentTypes,
              permissions: payloadPermissions,
            },
      },
      {
        onSuccess: () => router.push("/dashboard/roles"),
      }
    )
  }

  if (modulesLoading) {
    return <p className="text-sm text-muted-foreground">Loading modules…</p>
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit}>
      <div className="max-w-lg space-y-4">
        <TextField
          label="Name"
          required
          id="role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Slug"
          required
          id="role-slug"
          value={slug}
          disabled={isSystem}
          onChange={(e) =>
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
          }
          description={
            isSystem
              ? "System role slugs cannot be changed."
              : "Lowercase snake_case identifier. Changing this updates assigned users."
          }
        />
        <div className="space-y-2">
          <FormLabel htmlFor="role-description">Description</FormLabel>
          <textarea
            id="role-description"
            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {isSystem ? (
        <p className="rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          System roles always have full access. Permissions and shipment scopes cannot be
          changed.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold">Shipment type scope</h3>
              <p className="text-sm text-muted-foreground">
                Leave all unchecked to allow every shipment type.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {SHIPMENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={allowedShipmentTypes.includes(type)}
                    onCheckedChange={() => toggleShipmentType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold">Module permissions</h3>
              <p className="text-sm text-muted-foreground">
                Configure View, Create, Edit, and Delete for each module.
              </p>
            </div>
            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Module</th>
                    <th className="px-3 py-2 font-medium">View</th>
                    <th className="px-3 py-2 font-medium">Create</th>
                    <th className="px-3 py-2 font-medium">Edit</th>
                    <th className="px-3 py-2 font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedPermissions.map((row) => (
                    <tr key={row.module} className="border-t border-border/50">
                      <td className="px-3 py-2 font-medium">
                        {moduleLabels.get(row.module) ?? row.module}
                      </td>
                      {(
                        [
                          ["canView", "View"],
                          ["canCreate", "Create"],
                          ["canEdit", "Edit"],
                          ["canDelete", "Delete"],
                        ] as const
                      ).map(([key]) => (
                        <td key={key} className="px-3 py-2">
                          <Checkbox
                            checked={row[key]}
                            onCheckedChange={(checked) =>
                              setFlag(row.module, key, checked === true)
                            }
                            aria-label={`${row.module} ${key}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {mode === "edit"
            ? isPending
              ? "Saving..."
              : "Save changes"
            : isPending
              ? "Creating..."
              : "Create role"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/roles")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
