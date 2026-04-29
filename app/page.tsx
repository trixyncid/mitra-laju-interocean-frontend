"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/forms/login-form"
import backgroundImage from "@/public/images/login-background.png"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { redirect } from "next/navigation"

export default function LoginPage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <div></div>

  if (session) redirect("/dashboard")

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Freight Forwarding Systems
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src={backgroundImage} alt="Login Background" className="h-screen" />
      </div>
    </div>
  )
}
