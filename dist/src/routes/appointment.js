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
const appointmentService_1 = require("../services/appointmentService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const appointment_1 = require("../validations/appointment");
const rateLimiter_1 = require("../middleware/rateLimiter");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags:
 *       - Appointments
 *     summary: Yeni randevu oluştur
 *     description: Diyetisyen için yeni randevu oluşturur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dietitianId
 *               - date
 *               - time
 *             properties:
 *               dietitianId:
 *                 type: number
 *                 description: Diyetisyen ID
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Randevu tarihi (YYYY-MM-DD)
 *               time:
 *                 type: string
 *                 format: time
 *                 description: Randevu saati (HH:mm)
 *               notes:
 *                 type: string
 *                 description: Randevu notları
 *     responses:
 *       201:
 *         description: Randevu başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       409:
 *         description: Randevu çakışması
 *       429:
 *         description: Çok fazla istek
 *
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Randevuları listele
 *     description: Kullanıcının randevularını listeler (diyetisyen veya danışan)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         description: Randevu durumu filtresi
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi
 *     responses:
 *       200:
 *         description: Başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *
 * /api/appointments/{id}:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Randevu detayı
 *     description: Belirtilen randevunun detaylarını getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Randevu ID
 *     responses:
 *       200:
 *         description: Başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Randevu bulunamadı
 *
 * /api/appointments/{id}/status:
 *   patch:
 *     tags:
 *       - Appointments
 *     summary: Randevu durumu güncelle
 *     description: Randevu durumunu günceller (onaylama, iptal etme vb.)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Randevu ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED]
 *                 description: Yeni randevu durumu
 *               reason:
 *                 type: string
 *                 description: İptal nedeni (iptal durumunda)
 *     responses:
 *       200:
 *         description: Başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Randevu bulunamadı
 */
// Randevu oluşturma
router.post("/", auth_1.authenticateToken, (0, rbac_1.hasPermission)(["create:appointment"]), rateLimiter_1.appointmentLimiter, (0, requestValidator_1.requestValidator)(appointment_1.createAppointmentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointment = yield appointmentService_1.AppointmentService.createAppointment(req.user.userId, req.body);
        res.status(201).json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
}));
// Randevu güncelleme (durum değişikliği)
router.patch("/:id/status", auth_1.authenticateToken, (0, rbac_1.hasPermission)(["update:appointment"]), (0, requestValidator_1.requestValidator)(appointment_1.updateAppointmentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointment = yield appointmentService_1.AppointmentService.updateAppointmentStatus(req.params.id, req.user.userId, req.body);
        res.json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
}));
// Randevu listeleme (diyetisyen veya danışan için)
router.get("/", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(appointment_1.appointmentFilterSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield appointmentService_1.AppointmentService.getAppointments(req.user.userId, req.query);
        res.json(Object.assign({ success: true }, appointments));
    }
    catch (error) {
        next(error);
    }
}));
// Randevu detayı
router.get("/:id", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointment = yield appointmentService_1.AppointmentService.getAppointmentById(req.params.id, req.user.userId);
        res.json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
