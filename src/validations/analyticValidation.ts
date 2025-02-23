import { z } from "zod";

// Validasyon şemaları
export const trendAnalysisSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const predictionSchema = z.object({
  goalId: z.number(),
});

export const recommendationSchema = z.object({
  period: z.number().min(1).max(365).optional(),
});
