"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchParamsSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.searchParamsSchema = zod_1.z
    .object({
    specialization: zod_1.z.nativeEnum(client_1.Specialization).optional(),
    minPrice: zod_1.z.number().min(0).optional(),
    maxPrice: zod_1.z.number().min(0).optional(),
    availableDay: zod_1.z
        .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ])
        .optional(),
    availableTime: zod_1.z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(50).optional(),
})
    .refine((data) => {
    if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice;
    }
    return true;
}, {
    message: "Maksimum fiyat, minimum fiyattan küçük olamaz",
});
