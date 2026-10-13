"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import { IconDots, IconEye } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import {
  Dialog,
  DialogClose,
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
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

/** One entry of the "⋯" menu. Give exactly one of href / onSelect / copy / confirm. */
export type RowMenuAction = {
  label: string
  icon: ReactNode
  href?: string
  onSelect?: () => void
  /** Copies this text and says so. */
  copy?: string
  /** Asks first, e.g. delete. */
  confirm?: {
    title: string
    description: ReactNode
    confirmLabel?: string
    /** Resolve when done; throw (or reject) to keep the dialog open. */
    onConfirm: () => Promise<unknown> | void
  }
  tone?: "danger"
  disabled?: boolean
  /** Why it's disabled, shown under the label. */
  hint?: string
}

/**
 * The actions for one table row, made for a sticky right-hand column:
 * an optional contextual button (e.g. "Mark paid"), Quick look (opens the
 * record's panel in a side sheet without leaving the table), and a "⋯" menu.
 */
export function RowActions({
  name,
  quickLook,
  primary,
  menu,
}: {
  /** Record name for screen readers and the menu title, e.g. "SA001/…". */
  name: string
  /** The record's panel; gets a close callback. */
  quickLook?: (close: () => void) => ReactNode
  /** A contextual action shown before Quick look. */
  primary?: ReactNode
  /** Groups are separated by a line; falsy entries are skipped. */
  menu?: (RowMenuAction | null | false | undefined)[][]
}) {
  const [peek, setPeek] = useState(false)
  const [asking, setAsking] = useState<RowMenuAction | null>(null)
  const [busy, setBusy] = useState(false)
  const confirm = async () => {
    setBusy(true)
    try {
      await asking?.confirm?.onConfirm()
      setAsking(null)
    } catch {
      // The mutation shows its own error toast; keep the dialog so they can retry.
    } finally {
      setBusy(false)
    }
  }
  const groups = (menu ?? []).map((group) => group.filter(Boolean) as RowMenuAction[]).filter((group) => group.length)

  const run = (action: RowMenuAction) => {
    if (action.confirm) return setAsking(action)
    if (action.copy !== undefined) {
      void navigator.clipboard
        .writeText(action.copy)
        .then(() => toast.success("Copied", { description: action.copy }))
        .catch(() => toast.error("Could not copy"))
      return
    }
    action.onSelect?.()
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {primary}

      {quickLook ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPeek(true)}
          title="Quick look"
          aria-label={`Quick look at ${name}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <IconEye className="size-4" />
        </Button>
      ) : null}

      {groups.length ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              title="More actions"
              aria-label={`More actions for ${name}`}
              className="text-muted-foreground hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
            >
              <IconDots className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">{name}</DropdownMenuLabel>
            {groups.map((group, index) => (
              <div key={index}>
                <DropdownMenuSeparator />
                {group.map((action) => {
                  const content = (
                    <>
                      <span className="[&_svg]:size-4">{action.icon}</span>
                      <span className="flex min-w-0 flex-col">
                        <span>{action.label}</span>
                        {action.hint ? <span className="text-[11px] text-muted-foreground">{action.hint}</span> : null}
                      </span>
                    </>
                  )
                  const className = cn(
                    "cursor-pointer gap-2",
                    action.tone === "danger" &&
                      "text-[var(--mli-on-error-container)] focus:bg-[var(--mli-error-container)] focus:text-[var(--mli-on-error-container)] [&_svg]:!text-[var(--mli-on-error-container)]"
                  )
                  return action.href && !action.disabled ? (
                    <DropdownMenuItem key={action.label} asChild className={className}>
                      <Link href={action.href}>{content}</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      key={action.label}
                      disabled={action.disabled}
                      className={className}
                      onSelect={() => run(action)}
                    >
                      {content}
                    </DropdownMenuItem>
                  )
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {quickLook ? (
        <Sheet open={peek} onOpenChange={setPeek}>
          <SheetContent side="right" hideClose className="w-full gap-0 p-0 sm:max-w-xl">
            <SheetTitle className="sr-only">{name}</SheetTitle>
            <SheetDescription className="sr-only">Quick look. Close to go back to the table.</SheetDescription>
            {peek ? quickLook(() => setPeek(false)) : null}
          </SheetContent>
        </Sheet>
      ) : null}

      <Dialog open={Boolean(asking)} onOpenChange={(open) => !open && !busy && setAsking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{asking?.confirm?.title}</DialogTitle>
            <DialogDescription>{asking?.confirm?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            {asking?.tone === "danger" ? (
              <DeleteConfirmButton isPending={busy} onClick={confirm} />
            ) : (
              <Button disabled={busy} onClick={confirm}>
                {asking?.confirm?.confirmLabel ?? "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
