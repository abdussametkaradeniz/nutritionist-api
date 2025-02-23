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
const auth_1 = require("../../middleware/auth");
const activityLogService_1 = require("../../services/activityLogService");
const requestValidator_1 = require("../../middleware/requestValidator");
const filterActivityValidation_1 = require("src/validations/filterActivityValidation");
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
const router = express_1.default.Router();
// Aktivite loglarını getir
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = req.query.page
            ? parseInt(req.query.page)
            : undefined;
        const limit = req.query.limit
            ? parseInt(req.query.limit)
            : undefined;
        const activities = yield activityLogService_1.ActivityLogService.getUserActivities(req.user.userId, page, limit);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
}));
// Aktivite detayını getir
router.get("/:id", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activityId = parseInt(req.params.id);
        const activity = yield activityLogService_1.ActivityLogService.getActivityById(activityId, req.user.userId);
        res.json(activity);
    }
    catch (error) {
        next(error);
    }
}));
// Aktivite loglarını filtrele
router.post("/filter", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(filterActivityValidation_1.filterSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = Object.assign(Object.assign({}, req.body), { page: req.body.page ? parseInt(req.body.page) : undefined, limit: req.body.limit ? parseInt(req.body.limit) : undefined });
        const activities = yield activityLogService_1.ActivityLogService.filterActivities(req.user.userId, filters);
        res.json(activities);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
