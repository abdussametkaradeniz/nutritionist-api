import express from "express";
import { AnalyticsService } from "../services/analyticsService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";

const router = express.Router();

// Validasyon şemaları
const trendAnalysisSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const predictionSchema = z.object({
  goalId: z.number(),
});

const recommendationSchema = z.object({
  period: z.number().min(1).max(365).optional(),
});

// Trend analizi
router.get(
  "/trends",
  authenticateToken,
  requestValidator(trendAnalysisSchema),
  async (req, res, next) => {
    try {
      const trends = await AnalyticsService.analyzeTrends({
        userId: req.user!.userId,
        startDate: new Date(req.query.startDate as string),
        endDate: new Date(req.query.endDate as string),
      });
      res.json({ success: true, data: trends });
    } catch (error) {
      next(error);
    }
  }
);

// Tahminleme
router.get(
  "/predictions/:goalId",
  authenticateToken,
  requestValidator(predictionSchema),
  async (req, res, next) => {
    try {
      const predictions = await AnalyticsService.generatePredictions({
        userId: req.user!.userId,
        goalId: parseInt(req.params.goalId),
      });
      res.json({ success: true, data: predictions });
    } catch (error) {
      next(error);
    }
  }
);

// Öneriler
router.get(
  "/recommendations",
  authenticateToken,
  requestValidator(recommendationSchema),
  async (req, res, next) => {
    try {
      const recommendations = await AnalyticsService.generateRecommendations({
        userId: req.user!.userId,
        period: req.query.period
          ? parseInt(req.query.period as string)
          : undefined,
      });
      res.json({ success: true, data: recommendations });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
