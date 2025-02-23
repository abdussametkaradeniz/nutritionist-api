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
const mealPlanService_1 = require("../services/mealPlanService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Validasyon şemaları
const createMealPlanSchema = zod_1.z.object({
    dietitianId: zod_1.z.number().optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime().optional(),
    meals: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        time: zod_1.z.string().datetime(),
        notes: zod_1.z.string().optional(),
        foods: zod_1.z.array(zod_1.z.object({
            foodId: zod_1.z.number(),
            amount: zod_1.z.number().positive(),
            unit: zod_1.z.string(),
            notes: zod_1.z.string().optional(),
        })),
    })),
});
// Öğün planı oluştur
router.post("/", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createMealPlanSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mealPlan = yield mealPlanService_1.MealPlanService.createMealPlan(Object.assign(Object.assign({ userId: req.user.userId }, req.body), { startDate: new Date(req.body.startDate), endDate: req.body.endDate ? new Date(req.body.endDate) : undefined, meals: req.body.meals.map((meal) => (Object.assign(Object.assign({}, meal), { time: new Date(meal.time) }))) }));
        res.status(201).json({ success: true, data: mealPlan });
    }
    catch (error) {
        next(error);
    }
}));
// Öğün planı güncelle
router.patch("/:id", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createMealPlanSchema.partial()), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const mealPlan = yield mealPlanService_1.MealPlanService.updateMealPlan(Number(req.params.id), req.user.userId, Object.assign(Object.assign({}, req.body), { endDate: req.body.endDate ? new Date(req.body.endDate) : undefined, meals: (_a = req.body.meals) === null || _a === void 0 ? void 0 : _a.map((meal) => (Object.assign(Object.assign({}, meal), { time: new Date(meal.time) }))) }));
        res.json({ success: true, data: mealPlan });
    }
    catch (error) {
        next(error);
    }
}));
// Öğün planlarını listele
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mealPlans = yield mealPlanService_1.MealPlanService.getMealPlans({
            userId: req.user.userId,
            isActive: req.query.isActive === "true",
            startDate: req.query.startDate
                ? new Date(req.query.startDate)
                : undefined,
            endDate: req.query.endDate
                ? new Date(req.query.endDate)
                : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        res.json(Object.assign({ success: true }, mealPlans));
    }
    catch (error) {
        next(error);
    }
}));
// Günlük besin değeri hesapla
router.get("/:id/nutrition/:date", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nutrition = yield mealPlanService_1.MealPlanService.calculateDailyNutrition(Number(req.params.id), new Date(req.params.date));
        res.json({ success: true, data: nutrition });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
