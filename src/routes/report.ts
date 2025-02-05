import express from "express";
import { ReportService } from "../services/reportService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";

const router = express.Router();

// Validasyon şemaları
const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Özet raporu
router.get(
  "/summary",
  authenticateToken,
  requestValidator(dateRangeSchema),
  async (req, res, next) => {
    try {
      const report = await ReportService.generateSummaryReport({
        userId: req.user!.userId,
        startDate: new Date(req.query.startDate as string),
        endDate: new Date(req.query.endDate as string),
      });
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
);

// Besin tüketim analizi
router.get(
  "/nutrition",
  authenticateToken,
  requestValidator(dateRangeSchema),
  async (req, res, next) => {
    try {
      const report = await ReportService.generateNutritionReport({
        userId: req.user!.userId,
        startDate: new Date(req.query.startDate as string),
        endDate: new Date(req.query.endDate as string),
      });
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
