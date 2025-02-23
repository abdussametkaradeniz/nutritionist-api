import { Specialization } from "@prisma/client";
import { z } from "zod";

export const searchParamsSchema = z
  .object({
    specialization: z.nativeEnum(Specialization).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    availableDay: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    availableTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(50).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice;
      }
      return true;
    },
    {
      message: "Maksimum fiyat, minimum fiyattan küçük olamaz",
    }
  );
