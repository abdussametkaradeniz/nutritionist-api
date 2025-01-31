import { z } from "zod";

// Temel profil validasyon şeması
export const dietitianProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  about: z.string().min(10).max(1000),
  education: z.array(
    z.object({
      school: z.string().min(2).max(100),
      degree: z.string().min(2).max(100),
      field: z.string().min(2).max(100),
      startYear: z.number().int().min(1950).max(new Date().getFullYear()),
      endYear: z
        .number()
        .int()
        .min(1950)
        .max(new Date().getFullYear())
        .nullable(),
    })
  ),
  experience: z.array(
    z.object({
      institution: z.string().min(2).max(100),
      position: z.string().min(2).max(100),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().nullable(),
    })
  ),
  specializations: z.array(z.string().min(2).max(50)),
  languages: z.array(z.string().min(2).max(30)),
});

// Çalışma saatleri validasyon şeması
export const workingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean(),
});

// Fiyatlandırma validasyon şeması
export const pricingSchema = z.object({
  sessionDuration: z.number().int().min(15).max(180),
  price: z.number().positive(),
  currency: z.enum(["TRY", "USD", "EUR"]),
});

// Profil güncelleme validasyon şeması
export const updateProfileSchema = dietitianProfileSchema.partial();
