"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { TextField } from "@/components/ui/text-field"
import { useForm } from "@tanstack/react-form"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"
import { useRef, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { resolveRoleHomePathAfterAuth } from "@/lib/role-home"
import { loginEmailSchema, loginPasswordSchema } from "@/lib/schemas/login"
import { zodOnChange } from "@/lib/zod-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password"
const DEACTIVATED_ACCOUNT_MESSAGE = "This account has been deactivated."

function getAuthErrorMessage(message?: string | null) {
  if (message === DEACTIVATED_ACCOUNT_MESSAGE) {
    return DEACTIVATED_ACCOUNT_MESSAGE
  }
  return INVALID_CREDENTIALS_MESSAGE
}

type LoginFormProps = React.ComponentProps<"form"> & {
  variant?: "default" | "glass"
}

export function LoginForm({
  className,
  variant = "default",
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const [passwordType, setPasswordType] = useState("password")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<{
    message: string
    field: "email" | "password"
  } | null>(null)
  const isGlass = variant === "glass"

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      setAuthError(null)

      try {
        const { error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        })

        if (error) {
          const message = getAuthErrorMessage(error.message)
          const isDeactivated = message === DEACTIVATED_ACCOUNT_MESSAGE

          if (!isDeactivated) {
            form.setFieldValue("password", "")
            setPasswordType("password")
          }

          setAuthError({
            message,
            field: isDeactivated ? "email" : "password",
          })
          toast.error(message)

          requestAnimationFrame(() => {
            if (isDeactivated) {
              emailInputRef.current?.focus()
              return
            }
            passwordInputRef.current?.focus()
          })
          return
        }

        toast.success("Login successful")
        const { data: session } = await authClient.getSession()
        const homePath = await resolveRoleHomePathAfterAuth(session?.user)
        router.replace(homePath)
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

  const clearAuthError = () => {
    setAuthError(null)
  }

  const inputClass = isGlass
    ? "h-12 rounded-md border-[#c4c6cf] bg-white text-[#191c1e] shadow-none placeholder:text-[#74777f] focus-visible:border-[#325f9e] focus-visible:ring-[#325f9e]/20"
    : undefined

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
      <FieldGroup className={isGlass ? "gap-5" : undefined}>
        {!isGlass && (
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
        )}
        <form.Field
          name="email"
          validators={{
            onChange: zodOnChange(loginEmailSchema),
            onSubmit: zodOnChange(loginEmailSchema),
          }}
        >
          {(field) => (
            <TextField
              ref={emailInputRef}
              label="Email"
              required
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="email"
              placeholder={isGlass ? "you@company.com" : "m@example.com"}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                clearAuthError()
                field.handleChange(e.target.value)
              }}
              className={inputClass}
              error={
                field.state.meta.errors[0]
                  ? String(field.state.meta.errors[0])
                  : authError?.field === "email"
                    ? authError.message
                    : undefined
              }
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: zodOnChange(loginPasswordSchema),
            onSubmit: zodOnChange(loginPasswordSchema),
          }}
        >
          {(field) => (
            <TextField
              ref={passwordInputRef}
              label="Password"
              required
              id={field.name}
              name={field.name}
              type={passwordType}
              autoComplete="current-password"
              placeholder={isGlass ? "Enter your password" : "Password"}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                clearAuthError()
                field.handleChange(e.target.value)
              }}
              className={inputClass}
              error={
                field.state.meta.errors[0]
                  ? String(field.state.meta.errors[0])
                  : authError?.field === "password"
                    ? authError.message
                    : undefined
              }
              trailing={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={cn(
                    "inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors",
                    isGlass
                      ? "text-[#74777f] hover:bg-[#eef3f9] hover:text-[#191c1e]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-label={
                    passwordType === "password" ? "Show password" : "Hide password"
                  }
                >
                  {passwordType === "password" ? (
                    <EyeIcon className="size-4" />
                  ) : (
                    <EyeOffIcon className="size-4" />
                  )}
                </button>
              }
            />
          )}
        </form.Field>
        <Button
          type="submit"
          size={isGlass ? "lg" : "default"}
          disabled={isSubmitting}
          className={cn(
            "hover:cursor-pointer",
            isGlass &&
              "mt-1 h-12 w-full rounded-md bg-[#1b365d] text-[15px] font-semibold tracking-wide shadow-[0_8px_24px_rgba(27,54,93,0.2)] transition-[transform,background-color] duration-200 hover:bg-[#325f9e] active:scale-[0.98]"
          )}
        >
          {isSubmitting ? (
            isGlass ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Logging in..."
            )
          ) : isGlass ? (
            "Sign in"
          ) : (
            "Login"
          )}
        </Button>
      </FieldGroup>
    </form>
  )
}
