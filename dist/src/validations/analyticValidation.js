"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationSchema = exports.predictionSchema = exports.trendAnalysisSchema = void 0;
const zod_1 = require("zod");
// Validasyon şemaları
exports.trendAnalysisSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
});
exports.predictionSchema = zod_1.z.object({
    goalId: zod_1.z.number(),
});
exports.recommendationSchema = zod_1.z.object({
    period: zod_1.z.number().min(1).max(365).optional(),
});
