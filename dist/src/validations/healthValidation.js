"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSchema = exports.syncDataSchema = exports.connectSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
// Validasyon şemaları
exports.connectSchema = zod_1.z.object({
    provider: zod_1.z.nativeEnum(client_1.HealthAppProvider),
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.syncDataSchema = zod_1.z.object({
    provider: zod_1.z.nativeEnum(client_1.HealthAppProvider),
    data: zod_1.z.array(zod_1.z.object({
        dataType: zod_1.z.string(),
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        timestamp: zod_1.z.string().datetime(),
    })),
});
exports.getDataSchema = zod_1.z.object({
    dataType: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
