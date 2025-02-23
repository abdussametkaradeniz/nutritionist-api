"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentValidateSchema = exports.AppointmentStatus = void 0;
const zod_1 = require("zod");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["APPROVED"] = "APPROVED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
exports.AppointmentValidateSchema = zod_1.z.object({
    userId: zod_1.z.number().int().positive(),
    dietitianId: zod_1.z.number().int().positive(),
    date: zod_1.z.string().datetime(),
    time: zod_1.z.string(),
    status: zod_1.z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
    notes: zod_1.z.string().optional(),
    lastUpdatingUser: zod_1.z.string().optional(),
    lastUpdateDate: zod_1.z.string().datetime().optional(),
    recordStatus: zod_1.z.string().default("A"),
});
