"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFoodSchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
// Validasyon şemaları
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Kategori adı gerekli"),
    description: zod_1.z.string().optional(),
});
exports.createFoodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Besin adı gerekli"),
    categoryId: zod_1.z.number().int().positive(),
    calories: zod_1.z.number().min(0),
    protein: zod_1.z.number().min(0),
    carbs: zod_1.z.number().min(0),
    fat: zod_1.z.number().min(0),
    fiber: zod_1.z.number().min(0),
    sugar: zod_1.z.number().min(0).optional(),
    sodium: zod_1.z.number().min(0).optional(),
    cholesterol: zod_1.z.number().min(0).optional(),
    servingSize: zod_1.z.number().positive(),
    servingUnit: zod_1.z.string().min(1),
});
