import { emailSchema, passwordSchema, requiredString } from "./common"
import { z } from "zod"

export const userNameSchema = requiredString("Name")
export const userEmailSchema = emailSchema
export const userPasswordSchema = passwordSchema
export const userRoleSchema = z.string().min(1)

export const createUserFormSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: userPasswordSchema,
  roleId: userRoleSchema,
})

export const profileNameSchema = userNameSchema
export const profileEmailSchema = userEmailSchema
