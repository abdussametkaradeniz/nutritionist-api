"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestResetSchema = void 0;
const zod_1 = require("zod");
exports.requestResetSchema = zod_1.z.object({
    email: zod_1.z.string().email("Geçerli bir email adresi giriniz"),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string(),
    newPassword: zod_1.z
        .string()
        .min(6, "Şifre en az 6 karakter olmalıdır")
        .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
        .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
        .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
});
