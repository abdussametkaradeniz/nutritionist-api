import express from "express";
import { GoalService } from "../services/goalService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";
import { GoalStatus } from "@prisma/client";
import { createGoalSchema } from "src/validations/goalValidation";

const router = express.Router();

// Hedef oluştur
router.post(
  "/",
  authenticateToken,
  requestValidator(createGoalSchema),
  async (req, res, next) => {
    try {
      const goal = await GoalService.createGoal({
        userId: req.user!.userId,
        ...req.body,
        startDate: new Date(req.body.startDate),
        targetDate: new Date(req.body.targetDate),
      });
      res.status(201).json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }
);

// Hedefleri listele
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const goals = await GoalService.getGoals({
      userId: req.user!.userId,
      status: req.query.status as GoalStatus,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...goals });
  } catch (error) {
    next(error);
  }
});

// Hedef durumunu güncelle
router.patch(
  "/:id/status",
  authenticateToken,
  requestValidator(
    z.object({
      status: z.enum([
        GoalStatus.ACTIVE,
        GoalStatus.COMPLETED,
        GoalStatus.CANCELLED,
      ]),
    })
  ),
  async (req, res, next) => {
    try {
      const goal = await GoalService.updateGoalStatus(
        Number(req.params.id),
        req.user!.userId,
        req.body.status
      );
      res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }
);

// Hedef ilerleme durumunu hesapla
router.get("/:id/progress", authenticateToken, async (req, res, next) => {
  try {
    const progress = await GoalService.calculateProgress(Number(req.params.id));
    res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
});

export default router;
