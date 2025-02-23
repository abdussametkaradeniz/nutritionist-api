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
const goalService_1 = require("../services/goalService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Validasyon şemaları
const createGoalSchema = zod_1.z.object({
    dietitianId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime(),
    targetDate: zod_1.z.string().datetime(),
    startWeight: zod_1.z.number().positive().optional(),
    targetWeight: zod_1.z.number().positive().optional(),
    calorieTarget: zod_1.z.number().positive().optional(),
    proteinTarget: zod_1.z.number().min(0).max(100).optional(),
    carbTarget: zod_1.z.number().min(0).max(100).optional(),
    fatTarget: zod_1.z.number().min(0).max(100).optional(),
    notes: zod_1.z.string().optional(),
});
// Hedef oluştur
router.post("/", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createGoalSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield goalService_1.GoalService.createGoal(Object.assign(Object.assign({ userId: req.user.userId }, req.body), { startDate: new Date(req.body.startDate), targetDate: new Date(req.body.targetDate) }));
        res.status(201).json({ success: true, data: goal });
    }
    catch (error) {
        next(error);
    }
}));
// Hedefleri listele
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goals = yield goalService_1.GoalService.getGoals({
            userId: req.user.userId,
            status: req.query.status,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        res.json(Object.assign({ success: true }, goals));
    }
    catch (error) {
        next(error);
    }
}));
// Hedef durumunu güncelle
router.patch("/:id/status", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(zod_1.z.object({
    status: zod_1.z.enum([
        client_1.GoalStatus.ACTIVE,
        client_1.GoalStatus.COMPLETED,
        client_1.GoalStatus.CANCELLED,
    ]),
})), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield goalService_1.GoalService.updateGoalStatus(Number(req.params.id), req.user.userId, req.body.status);
        res.json({ success: true, data: goal });
    }
    catch (error) {
        next(error);
    }
}));
// Hedef ilerleme durumunu hesapla
router.get("/:id/progress", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield goalService_1.GoalService.calculateProgress(Number(req.params.id));
        res.json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
