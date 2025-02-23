import { HealthAppProvider } from "@prisma/client";
import { z } from "zod";

// Validasyon şemaları
export const connectSchema = z.object({
  provider: z.nativeEnum(HealthAppProvider),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const syncDataSchema = z.object({
  provider: z.nativeEnum(HealthAppProvider),
  data: z.array(
    z.object({
      dataType: z.string(),
      value: z.number(),
      unit: z.string(),
      timestamp: z.string().datetime(),
    })
  ),
});

export const getDataSchema = z.object({
  dataType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
