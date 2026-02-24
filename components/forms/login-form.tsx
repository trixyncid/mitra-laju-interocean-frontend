"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
    const router = useRouter()
    const [passwordType, setPasswordType] = useState("password")
    
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email({
                email: value.email,
                password: value.password,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Login successful")
                        router.push("/dashboard")
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message)
                    }
                }
            })
        }
    })

    const togglePasswordVisibility = () => {
        setPasswordType(passwordType === "password" ? "text" : "password")
    }

    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
        }} className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to login to your account
            </p>
            </div>
            <form.Field name="email" validators={{
            onChange: ({ value }) =>
                !value ? "Email is required" :
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email address" : undefined
            }}>
            {
                ( field ) => (
                <div>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input id={field.name} type="email" placeholder="m@example.com" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors ? (
                    <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                    ) : null}
                </div>
                )
            }
            </form.Field>
            <form.Field name="password" validators={{
            onChange: ({ value }) =>
                !value ? "Password is required" : undefined
            }}>
            {
                ( field ) => (
                <div>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="flex items-center">
                        <div className="relative w-full">
                            <Input id={field.name} type={passwordType} placeholder="Password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="pr-8" />
                            {passwordType === "password" ? (
                                <EyeIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" onClick={togglePasswordVisibility} />
                            ) : (
                                <EyeOffIcon className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2" onClick={togglePasswordVisibility} />
                            )}
                        </div>
                    </div>
                    {field.state.meta.errors ? (
                    <em className="text-xs text-red-500">{field.state.meta.errors}</em>
                    ) : null}
                </div>
                )
            }
            </form.Field>
            <Button type="submit" disabled={form.state.isSubmitting}>{form.state.isSubmitting ? "Logging in..." : "Login"}</Button>
        </FieldGroup>
        </form>
    )
}
