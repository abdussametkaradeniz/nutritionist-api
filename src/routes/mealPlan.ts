import express from "express";
import { MealPlanService } from "../services/mealPlanService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";
import { createMealPlanSchema } from "../validations/mealValidation";

const router = express.Router();

// Öğün planı oluştur
router.post(
  "/",
  authenticateToken,
  requestValidator(createMealPlanSchema),
  async (req, res, next) => {
    try {
      const mealPlan = await MealPlanService.createMealPlan({
        userId: req.user!.userId,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        meals: req.body.meals.map((meal: { time: string }) => ({
          ...meal,
          time: new Date(meal.time),
        })),
      });
      res.status(201).json({ success: true, data: mealPlan });
    } catch (error) {
      next(error);
    }
  }
);

// Öğün planı güncelle
router.patch(
  "/:id",
  authenticateToken,
  requestValidator(createMealPlanSchema.partial()),
  async (req, res, next) => {
    try {
      const mealPlan = await MealPlanService.updateMealPlan(
        Number(req.params.id),
        req.user!.userId,
        {
          ...req.body,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
          meals: req.body.meals?.map((meal: { time: string }) => ({
            ...meal,
            time: new Date(meal.time),
          })),
        }
      );
      res.json({ success: true, data: mealPlan });
    } catch (error) {
      next(error);
    }
  }
);

// Öğün planlarını listele
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const mealPlans = await MealPlanService.getMealPlans({
      userId: req.user!.userId,
      isActive: req.query.isActive === "true",
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...mealPlans });
  } catch (error) {
    next(error);
  }
});

// Günlük besin değeri hesapla
router.get(
  "/:id/nutrition/:date",
  authenticateToken,
  async (req, res, next) => {
    try {
      const nutrition = await MealPlanService.calculateDailyNutrition(
        Number(req.params.id),
        new Date(req.params.date)
      );
      res.json({ success: true, data: nutrition });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
