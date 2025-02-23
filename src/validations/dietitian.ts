import { z } from "zod";
import { Specialization } from "@prisma/client";

// Ortak validasyon kuralları
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const MIN_PRICE = 0;
const MAX_PRICE = 100000;
const MAX_SPECIALIZATIONS = 5;
const MIN_SESSION_COUNT = 1;
const MAX_SESSION_COUNT = 52; // Yıllık maksimum seans

// Temel profil validasyon şeması
export const dietitianProfileSchema = z.object({
  bio: z
    .string()
    .min(100, "Biyografi en az 100 karakter olmalıdır")
    .max(1000, "Biyografi en fazla 1000 karakter olabilir")
    .regex(
      /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s.,!?()-]+$/u,
      "Biyografi geçersiz karakterler içeriyor"
    ),

  education: z
    .array(
      z
        .string()
        .min(10, "Eğitim bilgisi çok kısa")
        .max(200, "Eğitim bilgisi çok uzun")
    )
    .min(1, "En az bir eğitim bilgisi girilmelidir")
    .max(10, "En fazla 10 eğitim bilgisi girilebilir"),

  experience: z
    .number()
    .min(0, "Deneyim yılı 0'dan küçük olamaz")
    .max(50, "Deneyim yılı 50'den büyük olamaz"),

  specializations: z
    .array(z.nativeEnum(Specialization))
    .min(1, "En az bir uzmanlık alanı seçilmelidir")
    .max(
      MAX_SPECIALIZATIONS,
      `En fazla ${MAX_SPECIALIZATIONS} uzmanlık alanı seçilebilir`
    ),

  certificates: z.array(z.string().url("Geçerli bir URL giriniz")).optional(),
});

// Çalışma saatleri validasyon şeması
export const workingHoursSchema = z.object({
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z
    .string()
    .regex(TIME_REGEX, "Geçerli bir saat giriniz (ÖR: 09:00)"),
  endTime: z.string().regex(TIME_REGEX, "Geçerli bir saat giriniz (ÖR: 17:00)"),
  isAvailable: z.boolean(),
});

// Fiyatlandırma validasyon şeması
export const pricingSchema = z.object({
  name: z
    .string()
    .min(3, "Paket adı en az 3 karakter olmalıdır")
    .max(100, "Paket adı en fazla 100 karakter olabilir"),

  description: z
    .string()
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(500, "Açıklama en fazla 500 karakter olabilir"),

  duration: z
    .number()
    .min(7, "Paket süresi en az 7 gün olmalıdır")
    .max(365, "Paket süresi en fazla 365 gün olabilir"),

  sessionCount: z
    .number()
    .min(MIN_SESSION_COUNT, `En az ${MIN_SESSION_COUNT} seans olmalıdır`)
    .max(MAX_SESSION_COUNT, `En fazla ${MAX_SESSION_COUNT} seans olabilir`),

  price: z
    .number()
    .min(MIN_PRICE, `Fiyat ${MIN_PRICE}'dan küçük olamaz`)
    .max(MAX_PRICE, `Fiyat ${MAX_PRICE}'dan büyük olamaz`),

  features: z
    .array(z.string().min(3, "Özellik çok kısa").max(100, "Özellik çok uzun"))
    .min(1, "En az bir özellik girilmelidir")
    .max(10, "En fazla 10 özellik girilebilir"),

  isActive: z.boolean().default(true),
});

// Profil güncelleme validasyon şeması
export const updateProfileSchema = dietitianProfileSchema.partial();
