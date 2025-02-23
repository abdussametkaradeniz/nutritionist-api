import { z } from "zod";

// Validasyon şemaları
export const createGoalSchema = z.object({
  dietitianId: z.number().optional(),
  startDate: z.string().datetime(),
  targetDate: z.string().datetime(),
  startWeight: z.number().positive().optional(),
  targetWeight: z.number().positive().optional(),
  calorieTarget: z.number().positive().optional(),
  proteinTarget: z.number().min(0).max(100).optional(),
  carbTarget: z.number().min(0).max(100).optional(),
  fatTarget: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});
