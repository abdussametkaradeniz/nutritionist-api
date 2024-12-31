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
exports.AppointmentDbManager = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class AppointmentDbManager {
    constructor() {
        this.checkAppointmentUsersAreBusy = (userId, dietitianId, appointmentDate) => __awaiter(this, void 0, void 0, function* () {
            const sessions = yield client_1.default.appointment.findMany({
                where: {
                    userId: userId,
                    dietitianId: dietitianId,
                    date: appointmentDate,
                    status: {
                        in: ["PENDING"],
                    },
                },
            });
            return sessions;
        });
        this.createAppointment = (request) => __awaiter(this, void 0, void 0, function* () {
            const session = yield client_1.default.appointment.create({
                data: Object.assign({}, request),
            });
            return session;
        });
        this.updateAppointment = (appointmentDate, status, id) => __awaiter(this, void 0, void 0, function* () {
            const updatedAppointment = yield client_1.default.appointment.update({
                where: { id: id },
                data: {
                    status: status,
                    date: appointmentDate,
                    lastUpdateDate: new Date(),
                    recordStatus: status === "CANCELLED" ? "P" : "A",
                },
            });
            return updatedAppointment;
        });
        this.listAppointments = (page, pageSize, status, recordStatus) => __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const whereCondition = {};
            if (status) {
                whereCondition.status = status;
            }
            if (recordStatus) {
                whereCondition.recordStatus = recordStatus;
            }
            const [appointments, total] = yield Promise.all([
                client_1.default.appointment.findMany({
                    where: whereCondition,
                    skip,
                    take: pageSize,
                    orderBy: {
                        date: "desc",
                    },
                    select: {
                        id: true,
                        date: true,
                        status: true,
                        recordStatus: true,
                        user: {
                            select: {
                                username: true,
                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        dietitian: {
                            select: {
                                username: true,
                                profile: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                    },
                }),
                client_1.default.appointment.count({
                    where: whereCondition,
                }),
            ]);
            return {
                appointments,
                pagination: {
                    total,
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                },
            };
        });
        this.approveAppointment = (appointmentId) => __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: "CONFIRMED",
                    lastUpdateDate: new Date(),
                },
            });
        });
        this.rejectAppointment = (appointmentId) => __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: "CANCELLED",
                    lastUpdateDate: new Date(),
                    recordStatus: "P",
                },
            });
        });
    }
    getAppointmentsByDietitian(dietitianId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.appointment.findMany({
                where: {
                    dietitianId: dietitianId,
                    recordStatus: "A",
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
}
exports.AppointmentDbManager = AppointmentDbManager;
