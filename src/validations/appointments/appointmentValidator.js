"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentValidateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const generalAppointmentType_1 = require("../../types/appointments/generalAppointmentType");
exports.AppointmentValidateSchema = joi_1.default.object({
    id: joi_1.default.number().integer().positive(), // Otomatik artan bir sayı
    userId: joi_1.default.number().integer().positive().required(), // Zorunlu kullanıcı ID
    dietitianId: joi_1.default.number().integer().positive().required(), // İsteğe bağlı diyetisyen ID
    date: joi_1.default.date().iso().required(), // ISO formatında zorunlu tarih
    status: joi_1.default.string()
        .valid(...Object.values(generalAppointmentType_1.AppointmentStatus))
        .default(generalAppointmentType_1.AppointmentStatus.PENDING), // Varsayılan değer PENDING
    lastUpdatingUser: joi_1.default.string().optional(), // İsteğe bağlı son güncelleyen kullanıcı
    lastUpdateDate: joi_1.default.date().iso().optional(), // ISO formatında son güncelleme tarihi
    recordStatus: joi_1.default.string().default("A"), // Varsayılan değer 'A'
});
