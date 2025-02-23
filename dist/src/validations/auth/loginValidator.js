"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Geçerli bir email adresi giriniz"),
    password: zod_1.z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});
