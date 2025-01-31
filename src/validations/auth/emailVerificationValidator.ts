import { z } from "zod";

export const requestVerificationSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token gereklidir"),
});
