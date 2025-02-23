import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../../middleware/auth";
import { NotificationService } from "../../services/notificationService";
import { requestValidator } from "../../middleware/requestValidator";
import { z } from "zod";
import { updatePreferencesSchema } from "../../validations/notificationValidator";

/**
 * @swagger
 * /api/user/notifications:
 *   get:
 *     tags:
 *       - User
 *     summary: Bildirimleri listele
 *     description: Kullanıcının bildirimlerini getirir
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
 *         description: Sayfa başına bildirim sayısı
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Okunma durumuna göre filtrele
 *     responses:
 *       200:
 *         description: Bildirimler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       message:
 *                         type: string
 *                       read:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: number
 *                 unreadCount:
 *                   type: number
 *
 *   put:
 *     tags:
 *       - User
 *     summary: Bildirimleri okundu işaretle
 *     description: Seçili bildirimleri okundu olarak işaretler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Bildirimler başarıyla güncellendi
 *
 *   delete:
 *     tags:
 *       - User
 *     summary: Bildirimleri sil
 *     description: Seçili bildirimleri siler
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Bildirimler başarıyla silindi
 */
const router = express.Router();
const prisma = new PrismaClient();

// Bildirim listesini getir
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const page = req.query.page
      ? parseInt(req.query.page as string)
      : undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const onlyUnread = req.query.onlyUnread === "true";

    const notifications = await NotificationService.getUserNotifications(
      req.user!.userId,
      page,
      limit,
      onlyUnread
    );

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// Bildirimi okundu olarak işaretle
router.put("/:id/read", authenticateToken, async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    const notification = await NotificationService.markAsRead(
      notificationId,
      req.user!.userId
    );

    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// Tüm bildirimleri okundu yap
router.put("/read-all", authenticateToken, async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user!.userId);
    res.json({ message: "Tüm bildirimler okundu olarak işaretlendi" });
  } catch (error) {
    next(error);
  }
});

// Okunmamış bildirim sayısını getir
router.get("/unread-count", authenticateToken, async (req, res, next) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user!.userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Bildirimi sil
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);

    await NotificationService.deleteNotification(
      notificationId,
      req.user!.userId
    );

    res.json({ message: "Bildirim silindi" });
  } catch (error) {
    next(error);
  }
});

// Bildirim tercihlerini getir
router.get("/preferences", authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { preferences: true },
    });

    res.json(user?.preferences);
  } catch (error) {
    next(error);
  }
});

// Bildirim tercihlerini güncelle
router.put(
  "/preferences",
  authenticateToken,
  requestValidator(updatePreferencesSchema),
  async (req, res, next) => {
    try {
      const preferences = await prisma.userPreferences.upsert({
        where: { userId: req.user!.userId },
        create: {
          ...req.body,
          userId: req.user!.userId,
          lastUpdatingUser: req.user!.userId.toString(),
        },
        update: {
          ...req.body,
          lastUpdateDate: new Date(),
          lastUpdatingUser: req.user!.userId.toString(),
        },
      });

      res.json(preferences);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
