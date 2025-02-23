"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgressSchema = void 0;
const zod_1 = require("zod");
exports.createProgressSchema = zod_1.z.object({
    date: zod_1.z.string().datetime(),
    weight: zod_1.z.number().positive().optional(),
    bodyFat: zod_1.z.number().min(0).max(100).optional(),
    muscle: zod_1.z.number().positive().optional(),
    water: zod_1.z.number().min(0).max(100).optional(),
    chest: zod_1.z.number().positive().optional(),
    waist: zod_1.z.number().positive().optional(),
    hip: zod_1.z.number().positive().optional(),
    arm: zod_1.z.number().positive().optional(),
    thigh: zod_1.z.number().positive().optional(),
    notes: zod_1.z.string().optional(),
});
