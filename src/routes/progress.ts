import express from "express";
import { ProgressService } from "../services/progressService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";
import multer from "multer";
import { createProgressSchema } from "src/validations/progressValidation";

const router = express.Router();
const upload = multer();

// İlerleme kaydı oluştur
router.post(
  "/",
  authenticateToken,
  upload.array("photos"),
  requestValidator(createProgressSchema),
  async (req, res, next) => {
    try {
      const photos = (req.files as Express.Multer.File[])?.map((file) => ({
        file,
        type: req.body[`photoTypes[${file.fieldname}]`] || "front",
      }));

      const progress = await ProgressService.createProgress(req.user!.userId, {
        ...req.body,
        date: new Date(req.body.date),
        photos,
      });
      res.status(201).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }
);

// İlerleme kayıtlarını listele
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const progress = await ProgressService.getProgress({
      userId: req.user!.userId,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...progress });
  } catch (error) {
    next(error);
  }
});

// İstatistikleri hesapla
router.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      throw new Error("Başlangıç ve bitiş tarihi gerekli");
    }

    const stats = await ProgressService.calculateStats(req.user!.userId, {
      startDate: new Date(req.query.startDate as string),
      endDate: new Date(req.query.endDate as string),
    });
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export default router;
