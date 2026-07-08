"use client"

import type { ComponentType } from "react"
import { IconCalendar, IconClock, IconUser } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
import { ProfileAvatarUpload } from "@/components/profile-avatar-upload"
import { RoleChip } from "@/components/ui/role-chip"
import { Separator } from "@/components/ui/separator"
import { localDate } from "@/lib/utils"

function MetadataRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  )
}

export function ProfileMetadataCard({ user }: { user: User }) {
  return (
    <div className="overflow-hidden rounded-[3rem] border border-border bg-card shadow-ambient-hover">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 pb-16 pt-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          Account overview
        </p>
        <h2 className="mt-1 text-xl font-semibold">{user.name}</h2>
        <p className="mt-1 truncate text-sm text-primary-foreground/80">{user.email}</p>
      </div>

      <div className="-mt-12 px-6 pb-6">
        <ProfileAvatarUpload
          userId={user.id}
          name={user.name}
          hasAvatar={!!user.image}
          avatarVersion={user.updatedAt}
        />

        <Separator className="my-6" />

        <div className="space-y-5">
          <MetadataRow icon={IconUser} label="Role">
            <RoleChip role={user.role} />
          </MetadataRow>

          <MetadataRow icon={IconCalendar} label="Date joined">
            {localDate(user.createdAt)}
          </MetadataRow>

          <MetadataRow icon={IconClock} label="Last updated">
            {localDate(user.updatedAt)}
          </MetadataRow>
        </div>
      </div>
    </div>
  )
}
