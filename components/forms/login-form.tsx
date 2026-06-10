"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import { getRoleHomePath } from "@/lib/role-home"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function validateEmail(value: string) {
    if (!value) return "Email is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address"
    return undefined
}

function validatePassword(value: string) {
    if (!value) return "Password is required"
    return undefined
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
    const router = useRouter()
    const [passwordType, setPasswordType] = useState("password")
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        canSubmitWhenInvalid: true,
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)

            try {
                const { error } = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                })

                if (error) {
                    toast.error(error.message ?? "Login failed")
                    return
                }

                toast.success("Login successful")
                const { data: session } = await authClient.getSession()
                router.replace(getRoleHomePath(session?.user))
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
    }

    const togglePasswordVisibility = () => {
        setPasswordType(passwordType === "password" ? "text" : "password")
    }

    return (
        <form
            noValidate
            onSubmit={handleFormSubmit}
            onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return
                if (!(e.target instanceof HTMLInputElement)) return
                e.preventDefault()
                e.currentTarget.requestSubmit()
            }}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
        <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
                Enter your email below to login to your account
            </p>
            </div>
            <form.Field name="email" validators={{
            onChange: ({ value }) => validateEmail(value),
            onSubmit: ({ value }) => validateEmail(value),
            }}>
            {
                ( field ) => (
                <Field>
                    <FieldLabel htmlFor={field.name} className="cursor-pointer">Email</FieldLabel>
                    <FieldContent>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            autoComplete="email"
                            placeholder="m@example.com"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={field.state.meta.errors.length > 0}
                            className="cursor-pointer"
                        />
                        {field.state.meta.errors.length ? (
                            <em className="text-xs text-[var(--mli-on-error-container)]">{String(field.state.meta.errors[0])}</em>
                        ) : null}
                    </FieldContent>
                </Field>
                )
            }
            </form.Field>
            <form.Field name="password" validators={{
            onChange: ({ value }) => validatePassword(value),
            onSubmit: ({ value }) => validatePassword(value),
            }}>
            {
                ( field ) => (
                <Field>
                    <FieldLabel htmlFor={field.name} className="cursor-pointer">Password</FieldLabel>
                    <FieldContent>
                        <div className="relative w-full">
                            <Input
                                id={field.name}
                                name={field.name}
                                type={passwordType}
                                autoComplete="current-password"
                                placeholder="Password"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                aria-invalid={field.state.meta.errors.length > 0}
                                className="cursor-pointer pr-10"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={passwordType === "password" ? "Show password" : "Hide password"}
                            >
                                {passwordType === "password" ? (
                                    <EyeIcon className="size-4" />
                                ) : (
                                    <EyeOffIcon className="size-4" />
                                )}
                            </button>
                        </div>
                        {field.state.meta.errors.length ? (
                            <em className="text-xs text-[var(--mli-on-error-container)]">{String(field.state.meta.errors[0])}</em>
                        ) : null}
                    </FieldContent>
                </Field>
                )
            }
            </form.Field>
            <Button type="submit" className="hover:cursor-pointer" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</Button>
        </FieldGroup>
        </form>
    )
}
