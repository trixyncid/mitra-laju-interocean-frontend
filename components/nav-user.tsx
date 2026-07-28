"use client"

import { useState } from "react"
import {
  IconDotsVertical,
  IconLogout,
  IconUser,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getInitialContactName } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { useUserProfile } from "@/hooks/use-profile"
import { useUserAvatarUrl } from "@/hooks/use-user-avatar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NavUser({
  user,
}: {
  user: {
    id: string
    name: string
    email: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: profile } = useUserProfile(user.id || undefined)
  const displayName = profile?.name ?? user.name
  const displayEmail = profile?.email ?? user.email
  const hasAvatar = !!profile?.image
  const avatarVersion = profile?.updatedAt
  const { data: avatarUrl } = useUserAvatarUrl(user.id, hasAvatar, avatarVersion)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully")
            setLogoutOpen(false)
          },
        },
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-[background-color,border-color] duration-200 hover:bg-white/[0.11] data-[state=open]:bg-white/[0.12] data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-9 rounded-full ring-2 ring-white/15">
                <AvatarImage
                  key={avatarUrl ?? "no-avatar"}
                  src={avatarUrl}
                  alt={displayName}
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="rounded-full bg-gradient-to-br from-[#6e9ef7] to-[#1b365d] text-xs font-semibold text-white">
                  {getInitialContactName(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/55">
                  {displayEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-sidebar-foreground/50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md border-[rgba(214,227,255,0.45)] bg-[rgba(247,249,251,0.96)] p-1 shadow-[0_16px_40px_rgba(27,54,93,0.16)] backdrop-blur-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuItem
              className="cursor-pointer rounded-sm px-3 py-2.5"
              onClick={() => router.push("/dashboard/profile")}
            >
              <IconUser />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-1 bg-[rgba(214,227,255,0.5)]" />
            <DropdownMenuItem
              className="cursor-pointer rounded-sm px-3 py-2.5 text-[var(--mli-on-error-container)] focus:bg-[var(--mli-error-container)] focus:text-[var(--mli-on-error-container)]"
              onClick={() => setLogoutOpen(true)}
            >
              <IconLogout className="text-[var(--mli-on-error-container)]" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Log out</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out of your account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
