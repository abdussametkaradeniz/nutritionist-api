"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentFilterSchema = exports.updateAppointmentSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createAppointmentSchema = zod_1.z
    .object({
    startTime: zod_1.z
        .string()
        .datetime()
        .refine((date) => new Date(date) > new Date(), {
        message: "Randevu tarihi geçmiş bir tarih olamaz",
    }),
    endTime: zod_1.z
        .string()
        .datetime()
        .refine((date) => new Date(date) > new Date(), {
        message: "Randevu bitiş tarihi geçmiş bir tarih olamaz",
    }),
    type: zod_1.z.nativeEnum(client_1.AppointmentType),
    notes: zod_1.z.string().max(500).optional(),
    dietitianId: zod_1.z.number(),
})
    .refine((data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
}, {
    message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır",
});
exports.updateAppointmentSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AppointmentStatus).optional(),
    notes: zod_1.z.string().max(500).optional(),
    cancelReason: zod_1.z.string().max(500).optional(),
});
exports.appointmentFilterSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.AppointmentStatus).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    type: zod_1.z.nativeEnum(client_1.AppointmentType).optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(50).default(10),
});
