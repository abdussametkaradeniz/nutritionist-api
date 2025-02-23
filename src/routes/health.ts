import express from "express";
import { HealthService } from "../services/healthService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";
import { HealthAppProvider } from "@prisma/client";
import {
  connectSchema,
  syncDataSchema,
  getDataSchema,
} from "src/validations/healthValidation";

const router = express.Router();

// Sağlık uygulaması bağlantısı
router.post(
  "/connect",
  authenticateToken,
  requestValidator(connectSchema),
  async (req, res, next) => {
    try {
      const connection = await HealthService.connectHealthApp({
        userId: req.user!.userId,
        ...req.body,
        ...(req.body.expiresAt && { expiresAt: new Date(req.body.expiresAt) }),
      });
      res.status(201).json({ success: true, data: connection });
    } catch (error) {
      next(error);
    }
  }
);

// Sağlık verisi senkronizasyonu
router.post(
  "/sync",
  authenticateToken,
  requestValidator(syncDataSchema),
  async (req, res, next) => {
    try {
      const healthData = await HealthService.syncHealthData({
        userId: req.user!.userId,
        provider: req.body.provider,
        data: req.body.data.map(
          (item: { timestamp: string; [key: string]: any }) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })
        ),
      });
      res.json({ success: true, data: healthData });
    } catch (error) {
      next(error);
    }
  }
);

// Sağlık verilerini getir
router.get(
  "/data",
  authenticateToken,
  requestValidator(getDataSchema),
  async (req, res, next) => {
    try {
      const healthData = await HealthService.getHealthData({
        userId: req.user!.userId,
        dataType: req.query.dataType as string | undefined,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      });
      res.json({ success: true, data: healthData });
    } catch (error) {
      next(error);
    }
  }
);

// Bağlantıyı sil
router.delete(
  "/disconnect/:provider",
  authenticateToken,
  requestValidator(
    z.object({
      provider: z.nativeEnum(HealthAppProvider),
    })
  ),
  async (req, res, next) => {
    try {
      await HealthService.disconnectHealthApp(
        req.user!.userId,
        req.params.provider as HealthAppProvider
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
