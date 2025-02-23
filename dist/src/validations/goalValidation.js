"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalSchema = void 0;
const zod_1 = require("zod");
// Validasyon şemaları
exports.createGoalSchema = zod_1.z.object({
    dietitianId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime(),
    targetDate: zod_1.z.string().datetime(),
    startWeight: zod_1.z.number().positive().optional(),
    targetWeight: zod_1.z.number().positive().optional(),
    calorieTarget: zod_1.z.number().positive().optional(),
    proteinTarget: zod_1.z.number().min(0).max(100).optional(),
    carbTarget: zod_1.z.number().min(0).max(100).optional(),
    fatTarget: zod_1.z.number().min(0).max(100).optional(),
    notes: zod_1.z.string().optional(),
});
