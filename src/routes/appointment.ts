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

const router = express.Router();

// Randevu oluşturma
router.post(
  "/",
  authenticateToken,
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
