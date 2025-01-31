import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { ActivityLogService } from "../../services/activityLogService";
import { requestValidator } from "../../middleware/requestValidator";
import { z } from "zod";

const router = express.Router();

// Validasyon şemaları
const filterSchema = z.object({
  action: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Aktivite loglarını getir
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const page = req.query.page
      ? parseInt(req.query.page as string)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;

    const activities = await ActivityLogService.getUserActivities(
      req.user!.userId,
      page,
      limit
    );

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Aktivite detayını getir
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);

    const activity = await ActivityLogService.getActivityById(
      activityId,
      req.user!.userId
    );

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Aktivite loglarını filtrele
router.post(
  "/filter",
  authenticateToken,
  requestValidator(filterSchema),
  async (req, res, next) => {
    try {
      const filters = {
        ...req.body,
        page: req.body.page ? parseInt(req.body.page) : undefined,
        limit: req.body.limit ? parseInt(req.body.limit) : undefined,
      };

      const activities = await ActivityLogService.filterActivities(
        req.user!.userId,
        filters
      );

      res.json(activities);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
