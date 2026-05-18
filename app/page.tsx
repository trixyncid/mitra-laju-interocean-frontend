"use client"

import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

import { LoginForm } from "@/components/forms/login-form"
import { useGuestOnly } from "@/hooks/use-auth-redirect"
import backgroundImage from "@/public/images/login-background.png"

export default function LoginPage() {
  const { isPending, isRedirecting } = useGuestOnly()

  if (isPending || isRedirecting) {
    return <div className="min-h-svh bg-background" />
  }

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 lg:px-12">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-foreground">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Freight Forwarding Systems
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image src={backgroundImage} alt="Login Background" className="h-screen object-cover" />
      </div>
    </div>
  )
}
