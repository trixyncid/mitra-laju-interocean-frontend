"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconSearch,
  IconUser,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissions } from "@/hooks/use-permissions"
import { useUserProfile } from "@/hooks/use-profile"
import { useUserAvatarUrl } from "@/hooks/use-user-avatar"
import { useVisibleNav } from "@/hooks/use-visible-nav"
import { authClient } from "@/lib/auth-client"
import { isSidebarNavActive, type NavEntry, type NavLinkItem } from "@/lib/nav"
import { cn, getInitialContactName } from "@/lib/utils"

const circleButton =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full surface text-foreground transition-[background-color,box-shadow] hover:bg-muted hover:shadow-elev-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15"

const pillItem =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15"

const pillItemActive = "brand-fill hover:text-primary-foreground"

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15",
        className
      )}
    >
      <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full brand-fill">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path
            d="M3 15.5c2 0 2-1.5 4.5-1.5S9.5 15.5 12 15.5s2.5-1.5 4.5-1.5 2.5 1.5 4.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 19.5c2 0 2-1.5 4.5-1.5S9.5 19.5 12 19.5s2.5-1.5 4.5-1.5 2.5 1.5 4.5 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path d="M7 11.5 12 4l5 7.5H7Z" fill="currentColor" />
        </svg>
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
          Mitra Laju
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">
          Interocean
        </span>
      </span>
    </Link>
  )
}

function NavGroupMenu({
  entry,
  pathname,
}: {
  entry: Extract<NavEntry, { kind: "group" }>
  pathname: string
}) {
  const isActive = entry.items.some((item) => isSidebarNavActive(pathname, item.href))
  const activeChild = entry.items.find((item) => isSidebarNavActive(pathname, item.href))

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group",
          pillItem,
          // On the blue fill the open state keeps white text and adds a halo instead of turning grey.
          isActive
            ? cn(pillItemActive, "data-[state=open]:ring-[3px] data-[state=open]:ring-primary/25 data-[state=open]:brightness-110")
            : "data-[state=open]:bg-muted data-[state=open]:text-foreground"
        )}
      >
        {activeChild ? activeChild.label : entry.label}
        <IconChevronDown
          className={cn("size-4 transition-transform group-data-[state=open]:rotate-180", isActive ? "opacity-80" : "opacity-60")}
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-72 rounded-lg border-border p-2 shadow-elev-3"
      >
        <DropdownMenuLabel className="px-3 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
          {entry.label}
        </DropdownMenuLabel>
        {entry.items.map((item) => {
          const active = isSidebarNavActive(pathname, item.href)
          return (
            <DropdownMenuItem
              key={item.href}
              asChild
              className={cn(
                "cursor-pointer rounded-md p-2",
                // The current page's whole row is filled, not just its icon.
                active && "brand-fill focus:text-primary-foreground focus:brightness-110"
              )}
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border",
                    active ? "border-transparent bg-primary-foreground/15" : "border-border bg-card"
                  )}
                >
                  <item.icon className={cn("size-4", active && "text-primary-foreground")} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn("text-sm font-medium", active ? "text-primary-foreground" : "text-foreground")}>
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className={cn("truncate text-xs", active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNav({ entries, pathname }: { entries: NavEntry[]; pathname: string }) {
  return (
    <nav
      aria-label="Main"
      className="hidden items-center gap-0.5 rounded-full surface p-1 lg:flex"
    >
      {entries.map((entry) => {
        if (entry.kind === "group") {
          return <NavGroupMenu key={entry.label} entry={entry} pathname={pathname} />
        }
        const active = isSidebarNavActive(pathname, entry.href)
        return (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={active ? "page" : undefined}
            className={cn(pillItem, active && pillItemActive)}
          >
            {entry.label}
          </Link>
        )
      })}
    </nav>
  )
}

function MobileNav({
  entries,
  pathname,
  open,
  onOpenChange,
}: {
  entries: NavEntry[]
  pathname: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const renderLink = (item: NavLinkItem) => {
    const active = isSidebarNavActive(pathname, item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => onOpenChange(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-12 items-center gap-3 rounded-full px-2 pr-4 text-[15px] font-medium transition-colors",
          active ? "brand-fill" : "text-foreground hover:bg-muted"
        )}
      >
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            active ? "bg-primary-foreground/15" : "bg-muted"
          )}
        >
          <item.icon className="size-4" aria-hidden />
        </span>
        {item.label}
      </Link>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[19rem] gap-0 border-r-0 bg-card p-0">
        <SheetHeader className="p-5 pb-3">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Go to a section of the dashboard</SheetDescription>
          <BrandMark />
        </SheetHeader>
        <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
          {entries.map((entry) =>
            entry.kind === "link" ? (
              renderLink(entry)
            ) : (
              <div key={entry.label} className="space-y-1">
                <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
                  {entry.label}
                </p>
                {entry.items.map(renderLink)}
              </div>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function QuickSearch({
  links,
  open,
  onOpenChange,
}: {
  links: NavLinkItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Jump to any section</DialogDescription>
        <Command className="flex flex-col" loop>
          <div className="flex items-center gap-3 border-b border-border px-5">
            <IconSearch className="size-5 text-muted-foreground" aria-hidden />
            <Command.Input
              autoFocus
              placeholder="Jump to…"
              className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
              Esc
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
              No matching section.
            </Command.Empty>
            {links.map((item) => (
              <Command.Item
                key={item.href}
                value={`${item.label} ${item.description ?? ""}`}
                onSelect={() => {
                  onOpenChange(false)
                  router.push(item.href)
                }}
                className="flex cursor-pointer items-center gap-3 rounded-full px-2 py-2 text-sm data-[selected=true]:bg-muted"
              >
                <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card">
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="font-medium">{item.label}</span>
                {item.description ? (
                  <span className="truncate text-muted-foreground">{item.description}</span>
                ) : null}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function UserMenu() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const { roleDetails } = usePermissions()
  const userId = session?.user?.id ?? ""
  const { data: profile } = useUserProfile(userId || undefined)
  const displayName = profile?.name ?? session?.user?.name ?? ""
  const displayEmail = profile?.email ?? session?.user?.email ?? ""
  const { data: avatarUrl } = useUserAvatarUrl(userId, !!profile?.image, profile?.updatedAt)
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
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex h-11 cursor-pointer items-center gap-2.5 rounded-full bg-card py-1 pl-1 pr-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15 data-[state=open]:bg-muted sm:pr-4">
          <Avatar className="size-9 rounded-full">
            <AvatarImage
              key={avatarUrl ?? "no-avatar"}
              src={avatarUrl}
              alt={displayName}
              className="rounded-full object-cover"
            />
            <AvatarFallback className="rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {getInitialContactName(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col leading-tight md:flex">
            <span className="max-w-[10rem] truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
            <span className="max-w-[10rem] truncate text-xs text-muted-foreground">
              {roleDetails?.name ?? displayEmail}
            </span>
          </span>
          <IconChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-64 rounded-lg border-border p-2 shadow-[0_16px_40px_rgba(var(--mli-ink-rgb),0.12)]"
        >
          <DropdownMenuLabel className="px-3 py-2 font-normal">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer rounded-full px-3 py-2.5"
            onClick={() => router.push("/dashboard/profile")}
          >
            <IconUser />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer rounded-full px-3 py-2.5"
            onClick={() => setLogoutOpen(true)}
          >
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Log out</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
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
    </>
  )
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}

export function AppTopNav() {
  const pathname = usePathname()
  const { entries, links, isPending } = useVisibleNav()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 8, () => false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        scrolled
          ? "bg-background/85 shadow-[0_1px_0_rgba(var(--mli-ink-rgb),0.06),0_10px_30px_-18px_rgba(var(--mli-ink-rgb),0.25)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-[var(--mli-container-max)] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
        <button
          type="button"
          className={cn(circleButton, "lg:hidden")}
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <IconMenu2 className="size-5" />
        </button>
        <BrandMark />

        <div className="flex flex-1 justify-center">
          {isPending ? (
            <Skeleton className="hidden h-11 w-[480px] rounded-full bg-card lg:block" />
          ) : (
            <DesktopNav entries={entries} pathname={pathname} />
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className={circleButton}
            onClick={() => setSearchOpen(true)}
            aria-label="Search sections (⌘K)"
          >
            <IconSearch className="size-5" />
          </button>
          <UserMenu />
        </div>
      </div>

      <MobileNav
        entries={entries}
        pathname={pathname}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />
      <QuickSearch links={links} open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
