"use client"

import { useState } from "react"
import { IconKey } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResetPassword } from "@/hooks/use-users"
import { generateTemporaryPassword } from "@/lib/temporary-password"

export default function UserResetPasswordDialog({
  user,
  triggerLabel,
}: {
  user: User
  triggerLabel?: string
}) {
  const resetPassword = useResetPassword()
  const [open, setOpen] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTemporaryPassword(null)
      setCopied(false)
    }
  }

  const handleReset = () => {
    const password = generateTemporaryPassword()
    resetPassword.mutate(
      { id: user.id, password },
      {
        onSuccess: () => {
          setTemporaryPassword(password)
        },
      }
    )
  }

  const handleCopy = async () => {
    if (!temporaryPassword) return
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size={triggerLabel ? "default" : "icon"} title="Reset password">
          <IconKey />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password for {user.name}</DialogTitle>
        </DialogHeader>

        {temporaryPassword ? (
          <div className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                A temporary password was generated in this browser and saved for {user.email}.
                Copy it and send it to the user securely (chat, phone, or in person). It is not
                returned by the API and will not appear in server logs.
              </p>
              <p className="font-medium text-foreground">
                This password cannot be retrieved again after you close this dialog. The user
                should sign in, then change it from their profile.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temporary-password">Temporary password</Label>
              <div className="flex gap-2">
                <Input
                  id="temporary-password"
                  readOnly
                  value={temporaryPassword}
                  className="font-mono"
                />
                <Button type="button" variant="secondary" onClick={handleCopy}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <DialogDescription>
            This will set a new random password for {user.email}. Share it with the user out of
            band. They must change it from their profile after signing in.
          </DialogDescription>
        )}

        <DialogFooter>
          {temporaryPassword ? (
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          ) : (
            <>
              <Button onClick={handleReset} disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Generating..." : "Generate password"}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
