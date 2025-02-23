"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.requestVerificationSchema = void 0;
const zod_1 = require("zod");
exports.requestVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Geçerli bir email adresi giriniz"),
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token gereklidir"),
});
