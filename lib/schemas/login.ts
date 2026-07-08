import { emailSchema } from "./common"
import { z } from "zod"

export const loginEmailSchema = emailSchema

export const loginPasswordSchema = z.string().min(1, "Password is required")

export const loginFormSchema = z.object({
  email: loginEmailSchema,
  password: loginPasswordSchema,
})
