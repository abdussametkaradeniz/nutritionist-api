"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeSchema = void 0;
const zod_1 = require("zod");
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
});
