import { z } from "zod";

// Validasyon şemaları
export const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gerekli"),
  description: z.string().optional(),
});

export const createFoodSchema = z.object({
  name: z.string().min(1, "Besin adı gerekli"),
  categoryId: z.number().int().positive(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  cholesterol: z.number().min(0).optional(),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
});
