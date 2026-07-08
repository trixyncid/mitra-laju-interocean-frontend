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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  key={avatarUrl ?? "no-avatar"}
                  src={avatarUrl}
                  alt={displayName}
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                  {getInitialContactName(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-sidebar-foreground">
                  {displayName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {displayEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-sidebar-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/dashboard/profile")}
            >
              <IconUser />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-[var(--mli-on-error-container)] hover:text-[var(--mli-on-error-container)]"
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
