import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { ActivityLogService } from "../../services/activityLogService";
import { requestValidator } from "../../middleware/requestValidator";
import { z } from "zod";
import { filterSchema } from "src/validations/filterActivityValidation";

/**
 * @swagger
 * /api/user/activity:
 *   get:
 *     tags:
 *       - User
 *     summary: Kullanıcı aktivitelerini listele
 *     description: Kullanıcının sistem içindeki aktivitelerini getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Sayfa başına aktivite sayısı
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login, profile_update, appointment, message, diet_plan]
 *         description: Aktivite tipine göre filtrele
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
 *         description: Aktiviteler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       type:
 *                         type: string
 *                         enum: [login, profile_update, appointment, message, diet_plan]
 *                       description:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: number
 *       401:
 *         description: Yetkilendirme hatası
 *
 *   delete:
 *     tags:
 *       - User
 *     summary: Aktivite geçmişini temizle
 *     description: Belirli bir tarihten önceki aktiviteleri siler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               beforeDate:
 *                 type: string
 *                 format: date
 *                 description: Bu tarihten önceki aktiviteler silinecek
 *     responses:
 *       200:
 *         description: Aktiviteler başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 */
const router = express.Router();

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
