import express from "express";
import { AppointmentService } from "../services/appointmentService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentFilterSchema,
} from "../schemas/appointment";
import { appointmentLimiter } from "../middleware/rateLimiter";
import { Role, Permission } from "../models/role.model";
import { hasRole, hasPermission } from "../middleware/rbac";

const router = express.Router();

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
router.post(
  "/",
  authenticateToken,
  hasPermission([Permission.CREATE_APPOINTMENT]),
  appointmentLimiter,
  requestValidator(createAppointmentSchema),
  async (req, res, next) => {
    try {
      const appointment = await AppointmentService.createAppointment(
        req.user!.userId,
        req.body
      );
      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }
);

// Randevu güncelleme (durum değişikliği)
router.patch(
  "/:id/status",
  authenticateToken,
  hasPermission([Permission.UPDATE_APPOINTMENT]),
  requestValidator(updateAppointmentSchema),
  async (req, res, next) => {
    try {
      const appointment = await AppointmentService.updateAppointmentStatus(
        req.params.id,
        req.user!.userId,
        req.body
      );
      res.json({ success: true, data: appointment });
    } catch (error) {
      next(error);
    }
  }
);

// Randevu listeleme (diyetisyen veya danışan için)
router.get(
  "/",
  authenticateToken,
  requestValidator(appointmentFilterSchema),
  async (req, res, next) => {
    try {
      const appointments = await AppointmentService.getAppointments(
        req.user!.userId,
        req.query
      );
      res.json({ success: true, ...appointments });
    } catch (error) {
      next(error);
    }
  }
);

// Randevu detayı
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const appointment = await AppointmentService.getAppointmentById(
      req.params.id,
      req.user!.userId
    );
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
});

export default router;
