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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentManager = void 0;
const appointmentDbManager_1 = require("../../database/appointmentDbManager");
const exception_1 = require("../../domain/exception");
const exception_2 = require("../../domain/exception");
class AppointmentManager {
    constructor(request) {
        this.request = request;
        this.appointmentDbManager = new appointmentDbManager_1.AppointmentDbManager();
    }
    createAppointment() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            //daha önceden set edilen bir toplantı var mı ona bak
            const currentSessions = yield this.appointmentDbManager.checkAppointmentUsersAreBusy((_a = this.request) === null || _a === void 0 ? void 0 : _a.userId, (_b = this.request) === null || _b === void 0 ? void 0 : _b.dietitianId, (_c = this.request) === null || _c === void 0 ? void 0 : _c.date);
            if (currentSessions.length > 0) {
                throw new exception_1.BusinessException("User have appointment", 400);
            }
            //toplantıyı oluştur.
            const createdSession = yield this.appointmentDbManager.createAppointment(this.request);
            return createdSession;
        });
    }
    updateAppointment() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const updatedSession = yield this.appointmentDbManager.updateAppointment((_a = this.request) === null || _a === void 0 ? void 0 : _a.date, (_b = this.request) === null || _b === void 0 ? void 0 : _b.status, (_c = this.request) === null || _c === void 0 ? void 0 : _c.id);
            if (!updatedSession) {
                throw new exception_1.BusinessException("something went wrong", 400);
            }
            return updatedSession;
        });
    }
    approveAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentDbManager.approveAppointment(appointmentId);
            if (!appointment) {
                throw new exception_2.NotFound("Appointment not found");
            }
            if (appointment.status === "CANCELLED") {
                throw new exception_1.BusinessException("Cannot approve a cancelled appointment", 400);
            }
            return appointment;
        });
    }
    rejectAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = yield this.appointmentDbManager.rejectAppointment(appointmentId);
            if (!appointment) {
                throw new exception_2.NotFound("Appointment not found");
            }
            if (appointment.status === "CONFIRMED") {
                throw new exception_1.BusinessException("Cannot reject a confirmed appointment", 400);
            }
            return appointment;
        });
    }
    sendNotificationForAppointment() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    listAppointments(page, pageSize, status, recordStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.appointmentDbManager.listAppointments(page, pageSize, status, recordStatus);
                if (!result.appointments.length && page > 1) {
                    throw new exception_2.NotFound("No appointments found for this page");
                }
                return result;
            }
            catch (error) {
                if (error instanceof exception_2.NotFound) {
                    throw error;
                }
                throw new exception_1.BusinessException("Error while fetching appointments", 500);
            }
        });
    }
}
exports.AppointmentManager = AppointmentManager;
