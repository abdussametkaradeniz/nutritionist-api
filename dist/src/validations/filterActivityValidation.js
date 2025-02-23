"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterSchema = void 0;
const zod_1 = require("zod");
// Validasyon şemaları
exports.filterSchema = zod_1.z.object({
    action: zod_1.z.string().optional(),
    startDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    endDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
});
