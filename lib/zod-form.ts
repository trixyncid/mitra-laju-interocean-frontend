import type { z } from "zod"
import type { FieldValidateFn } from "@tanstack/react-form"
import { passwordSchema, newPasswordSchema } from "@/lib/schemas/common"

export function zodFieldError(schema: z.ZodType, value: unknown): string | undefined {
  const result = schema.safeParse(value)
  if (result.success) return undefined
  return result.error.issues[0]?.message ?? "Invalid value"
}

export function zodOnChange<T extends z.ZodType>(schema: T) {
  return ({ value }: { value: unknown }) => zodFieldError(schema, value)
}

export function zodFormValidator<T extends z.ZodType>(schema: T) {
  return ({ value }: { value: unknown }) => zodFieldError(schema, value)
}

type PasswordFieldApi = {
  form: {
    getFieldValue: (name: string) => string
    validateField: (name: string, cause: "change" | "submit" | "blur" | "mount") => void
  }
}

export function matchPasswordField(
  passwordField: string,
  options: { emptyMessage: string; mismatchMessage: string }
): FieldValidateFn<any, any, string> {
  return (({ value, fieldApi }: { value: string; fieldApi: PasswordFieldApi }) => {
    if (!value) return options.emptyMessage
    const password = fieldApi.form.getFieldValue(passwordField)
    if (value !== password) return options.mismatchMessage
    return undefined
  }) as FieldValidateFn<any, any, string>
}

export function passwordWithConfirmRevalidate(confirmField: string): FieldValidateFn<any, any, string> {
  return (({ value, fieldApi }: { value: string; fieldApi: PasswordFieldApi }) => {
    const error = zodFieldError(passwordSchema, value)
    if (!error && fieldApi.form.getFieldValue(confirmField)) {
      fieldApi.form.validateField(confirmField, "change")
    }
    return error
  }) as FieldValidateFn<any, any, string>
}

export function newPasswordWithConfirmRevalidate(confirmField: string): FieldValidateFn<any, any, string> {
  return (({ value, fieldApi }: { value: string; fieldApi: PasswordFieldApi }) => {
    const error = zodFieldError(newPasswordSchema, value)
    if (!error && fieldApi.form.getFieldValue(confirmField)) {
      fieldApi.form.validateField(confirmField, "change")
    }
    return error
  }) as FieldValidateFn<any, any, string>
}
