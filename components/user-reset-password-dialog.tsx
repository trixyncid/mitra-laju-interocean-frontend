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

export default function UserResetPasswordDialog({ user }: { user: User }) {
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
    resetPassword.mutate(user.id, {
      onSuccess: (data) => {
        setTemporaryPassword(data.temporaryPassword)
      },
    })
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
        <Button variant="outline" size="icon" title="Reset password">
          <IconKey />
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
                A temporary password has been generated. Copy it and send it to the user
                securely. They should sign in with this password, then go to their profile and
                change it to a new password of their choice.
              </p>
              <p className="font-medium text-foreground">
                This password cannot be retrieved again after you close this dialog.
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
            This will generate a new random 8-character password for {user.email}. The user must
            change it from their profile after signing in.
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
