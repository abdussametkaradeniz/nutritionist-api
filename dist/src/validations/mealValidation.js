"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMealPlanSchema = void 0;
const zod_1 = require("zod");
// Validasyon şemaları
exports.createMealPlanSchema = zod_1.z.object({
    dietitianId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    meals: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        time: zod_1.z.string().datetime(),
        notes: zod_1.z.string().optional(),
        foods: zod_1.z.array(zod_1.z.object({
            foodId: zod_1.z.number(),
            amount: zod_1.z.number().positive(),
            unit: zod_1.z.string(),
            notes: zod_1.z.string().optional(),
        })),
    })),
});
