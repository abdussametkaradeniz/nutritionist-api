"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../../middleware/auth");
const notificationService_1 = require("../../services/notificationService");
const requestValidator_1 = require("../../middleware/requestValidator");
const notificationValidator_1 = require("../../validations/notificationValidator");
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
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Bildirim listesini getir
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page
            ? parseInt(req.query.page)
            : undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit)
            : undefined;
        const onlyUnread = req.query.onlyUnread === "true";
        const notifications = yield notificationService_1.NotificationService.getUserNotifications(req.user.userId, page, limit, onlyUnread);
        res.json(notifications);
    }
    catch (error) {
        next(error);
    }
}));
// Bildirimi okundu olarak işaretle
router.put("/:id/read", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificationId = parseInt(req.params.id);
        const notification = yield notificationService_1.NotificationService.markAsRead(notificationId, req.user.userId);
        res.json(notification);
    }
    catch (error) {
        next(error);
    }
}));
// Tüm bildirimleri okundu yap
router.put("/read-all", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield notificationService_1.NotificationService.markAllAsRead(req.user.userId);
        res.json({ message: "Tüm bildirimler okundu olarak işaretlendi" });
    }
    catch (error) {
        next(error);
    }
}));
// Okunmamış bildirim sayısını getir
router.get("/unread-count", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield notificationService_1.NotificationService.getUnreadCount(req.user.userId);
        res.json({ count });
    }
    catch (error) {
        next(error);
    }
}));
// Bildirimi sil
router.delete("/:id", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificationId = parseInt(req.params.id);
        yield notificationService_1.NotificationService.deleteNotification(notificationId, req.user.userId);
        res.json({ message: "Bildirim silindi" });
    }
    catch (error) {
        next(error);
    }
}));
// Bildirim tercihlerini getir
router.get("/preferences", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { preferences: true },
        });
        res.json(user === null || user === void 0 ? void 0 : user.preferences);
    }
    catch (error) {
        next(error);
    }
}));
// Bildirim tercihlerini güncelle
router.put("/preferences", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(notificationValidator_1.updatePreferencesSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const preferences = yield prisma.userPreferences.upsert({
            where: { userId: req.user.userId },
            create: Object.assign(Object.assign({}, req.body), { userId: req.user.userId, lastUpdatingUser: req.user.userId.toString() }),
            update: Object.assign(Object.assign({}, req.body), { lastUpdateDate: new Date(), lastUpdatingUser: req.user.userId.toString() }),
        });
        res.json(preferences);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
