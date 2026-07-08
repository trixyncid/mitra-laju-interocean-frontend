import { emailSchema, passwordSchema, requiredString } from "./common"
import { USER_ROLES } from "@/lib/permissions"
import { z } from "zod"

export const userNameSchema = requiredString("Name")
export const userEmailSchema = emailSchema
export const userPasswordSchema = passwordSchema
export const userRoleSchema = z.enum(USER_ROLES)

export const createUserFormSchema = z.object({
  name: userNameSchema,
  email: userEmailSchema,
  password: userPasswordSchema,
  role: userRoleSchema,
})

export const profileNameSchema = userNameSchema
export const profileEmailSchema = userEmailSchema
