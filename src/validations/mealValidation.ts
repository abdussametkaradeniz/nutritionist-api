import { z } from "zod";

// Validasyon şemaları
export const createMealPlanSchema = z.object({
  dietitianId: z.number().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  meals: z.array(
    z.object({
      name: z.string().min(1),
      time: z.string().datetime(),
      notes: z.string().optional(),
      foods: z.array(
        z.object({
          foodId: z.number(),
          amount: z.number().positive(),
          unit: z.string(),
          notes: z.string().optional(),
        })
      ),
    })
  ),
});
