"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
    email: zod_1.z.string().email("Geçerli bir email adresi giriniz"),
    password: zod_1.z
        .string()
        .min(6, "Şifre en az 6 karakter olmalıdır")
        .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir")
        .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir")
        .regex(/[0-9]/, "Şifre en az bir rakam içermelidir"),
    phoneNumber: zod_1.z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, "Geçerli bir telefon numarası giriniz")
        .optional(),
    fullName: zod_1.z.string().min(2, "İsim en az 2 karakter olmalıdır").optional(),
});
