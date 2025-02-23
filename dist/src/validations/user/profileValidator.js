"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(30).optional(),
    email: zod_1.z.string().email().optional(),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .optional(),
    fullName: zod_1.z.string().min(2).max(100).optional(),
    birthDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    height: zod_1.z.number().min(50).max(300).optional(),
    weight: zod_1.z.number().min(20).max(500).optional(),
    address: zod_1.z.string().max(500).optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6).max(100),
    confirmPassword: zod_1.z.string().min(6).max(100),
});
exports.updatePreferencesSchema = zod_1.z.object({
    language: zod_1.z.string().min(2).max(5).optional(),
    timezone: zod_1.z.string().max(50).optional(),
    theme: zod_1.z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
    emailNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
});
