import { z } from "zod";

export const createProgressSchema = z.object({
  date: z.string().datetime(),
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscle: z.number().positive().optional(),
  water: z.number().min(0).max(100).optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  hip: z.number().positive().optional(),
  arm: z.number().positive().optional(),
  thigh: z.number().positive().optional(),
  notes: z.string().optional(),
});
