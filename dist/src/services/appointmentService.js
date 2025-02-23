"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
const dietitianService_1 = require("./dietitianService");
class AppointmentService {
    static createAppointment(clientId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Diyetisyenin müsaitlik kontrolü
            const isAvailable = yield this.checkDietitianAvailability(data.dietitianId, new Date(data.startTime), new Date(data.endTime));
            if (!isAvailable) {
                throw new appError_1.AppError("Seçilen zaman diliminde diyetisyen müsait değil", 400);
            }
            // Danışanın başka randevusu var mı kontrolü
            const hasConflict = yield this.checkClientConflict(clientId, new Date(data.startTime), new Date(data.endTime));
            if (hasConflict) {
                throw new appError_1.AppError("Seçilen zaman diliminde başka bir randevunuz var", 400);
            }
            return yield client_2.default.appointment.create({
                data: {
                    startTime: new Date(data.startTime),
                    endTime: new Date(data.endTime),
                    type: data.type,
                    notes: data.notes,
                    clientId,
                    dietitianId: data.dietitianId,
                    status: client_1.AppointmentStatus.PENDING,
                },
                include: {
                    client: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                    dietitian: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
    static updateAppointmentStatus(appointmentId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield client_2.default.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    client: true,
                    dietitian: true,
                },
            });
            if (!appointment) {
                throw new appError_1.AppError("Randevu bulunamadı", 404);
            }
            // Yetki kontrolü
            if (appointment.clientId !== userId && appointment.dietitianId !== userId) {
                throw new appError_1.AppError("Bu işlem için yetkiniz yok", 403);
            }
            // İptal edilmiş randevu tekrar güncellenemez
            if (appointment.status === client_1.AppointmentStatus.CANCELLED) {
                throw new appError_1.AppError("İptal edilmiş randevu güncellenemez", 400);
            }
            return yield client_2.default.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: data.status,
                    cancelReason: data.cancelReason,
                    cancelledBy: data.status === client_1.AppointmentStatus.CANCELLED
                        ? userId.toString()
                        : undefined,
                },
                include: {
                    client: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                    dietitian: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
        });
    }
    static checkDietitianAvailability(dietitianId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Çalışma saatleri kontrolü
            const workingHours = yield dietitianService_1.DietitianService.getWorkingHours(dietitianId.toString());
            const day = startTime
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase();
            const isWorkingDay = workingHours.some((wh) => wh.day === day &&
                wh.isAvailable &&
                this.isTimeInRange(startTime, wh.startTime, wh.endTime) &&
                this.isTimeInRange(endTime, wh.startTime, wh.endTime));
            if (!isWorkingDay)
                return false;
            // Randevu çakışması kontrolü
            const conflictingAppointment = yield client_2.default.appointment.findFirst({
                where: {
                    dietitianId,
                    status: {
                        in: [client_1.AppointmentStatus.PENDING, client_1.AppointmentStatus.CONFIRMED],
                    },
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: startTime } },
                                { endTime: { gt: startTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { lt: endTime } },
                                { endTime: { gte: endTime } },
                            ],
                        },
                    ],
                },
            });
            return !conflictingAppointment;
        });
    }
    static checkClientConflict(clientId, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const conflictingAppointment = yield client_2.default.appointment.findFirst({
                where: {
                    clientId,
                    status: {
                        in: [client_1.AppointmentStatus.PENDING, client_1.AppointmentStatus.CONFIRMED],
                    },
                    OR: [
                        {
                            AND: [
                                { startTime: { lte: startTime } },
                                { endTime: { gt: startTime } },
                            ],
                        },
                        {
                            AND: [
                                { startTime: { lt: endTime } },
                                { endTime: { gte: endTime } },
                            ],
                        },
                    ],
                },
            });
            return !!conflictingAppointment;
        });
    }
    static isTimeInRange(time, start, end) {
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        const timeHour = time.getHours();
        const timeMinute = time.getMinutes();
        const timeInMinutes = timeHour * 60 + timeMinute;
        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;
        return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
    }
    static getAppointments(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, startDate, endDate, type, page = 1, limit = 10 } = filters;
            const where = {
                OR: [{ clientId: userId }, { dietitianId: userId }],
                AND: [
                    status ? { status } : {},
                    startDate ? { startTime: { gte: new Date(startDate) } } : {},
                    endDate ? { endTime: { lte: new Date(endDate) } } : {},
                    type ? { type } : {},
                ],
            };
            const [appointments, total] = yield Promise.all([
                client_2.default.appointment.findMany({
                    where,
                    include: {
                        client: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                        dietitian: {
                            select: {
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        startTime: "desc",
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                client_2.default.appointment.count({ where }),
            ]);
            return {
                data: appointments,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    static getAppointmentById(appointmentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield client_2.default.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    client: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                    dietitian: {
                        select: {
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });
            if (!appointment) {
                throw new appError_1.AppError("Randevu bulunamadı", 404);
            }
            // Yetki kontrolü
            if (appointment.clientId !== userId && appointment.dietitianId !== userId) {
                throw new appError_1.AppError("Bu randevuyu görüntüleme yetkiniz yok", 403);
            }
            return appointment;
        });
    }
}
exports.AppointmentService = AppointmentService;
