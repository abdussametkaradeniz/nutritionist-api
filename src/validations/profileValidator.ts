import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  fullName: z.string().min(2).max(100).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  address: z.string().max(500).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
});

export const updatePreferencesSchema = z.object({
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().max(50).optional(),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});
