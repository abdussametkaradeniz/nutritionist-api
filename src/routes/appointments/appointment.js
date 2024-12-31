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
const express_1 = __importDefault(require("express"));
const requestValidator_1 = require("../../middleware/requestValidator");
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const appointmentValidator_1 = require("../../validations/appointments/appointmentValidator");
const appointmentManager_1 = require("../../bussiness/appointments/appointmentManager");
const router = express_1.default.Router();
router.post("/add-appointment", (0, requestValidator_1.requestValidator)(appointmentValidator_1.AppointmentValidateSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const appointmentManager = new appointmentManager_1.AppointmentManager(request);
        const result = yield appointmentManager.createAppointment();
        (0, responseHandler_1.sendSuccess)(res, result, "appointment created successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.post("/update-appointment", (0, requestValidator_1.requestValidator)(appointmentValidator_1.AppointmentValidateSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const appointmentManager = new appointmentManager_1.AppointmentManager(request);
        const result = yield appointmentManager.updateAppointment();
        (0, responseHandler_1.sendSuccess)(res, result, "appointment updated successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const status = req.query.status;
    const recordStatus = req.query.recordStatus;
    try {
        const appointmentManager = new appointmentManager_1.AppointmentManager();
        const result = yield appointmentManager.listAppointments(page, pageSize, status, recordStatus);
        (0, responseHandler_1.sendSuccess)(res, result, "appointments retrieved successfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound || error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.patch("/reject-appointment", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.body;
    try {
        const appointmentManager = new appointmentManager_1.AppointmentManager();
        const result = yield appointmentManager.rejectAppointment(appointmentId);
        (0, responseHandler_1.sendSuccess)(res, result, "appointment rejected successfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.patch("/approve-appointment", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId } = req.body;
    try {
        const appointmentManager = new appointmentManager_1.AppointmentManager();
        const result = yield appointmentManager.approveAppointment(appointmentId);
        (0, responseHandler_1.sendSuccess)(res, result, "appointment approved successfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
