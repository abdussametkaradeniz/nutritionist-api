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
const analyticsService_1 = require("../services/analyticsService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const analyticValidation_1 = require("src/validations/analyticValidation");
const router = express_1.default.Router();
// Trend analizi
router.get("/trends", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(analyticValidation_1.trendAnalysisSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trends = yield analyticsService_1.AnalyticsService.analyzeTrends({
            userId: req.user.userId,
            startDate: new Date(req.query.startDate),
            endDate: new Date(req.query.endDate),
        });
        res.json({ success: true, data: trends });
    }
    catch (error) {
        next(error);
    }
}));
// Tahminleme
router.get("/predictions/:goalId", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(analyticValidation_1.predictionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const predictions = yield analyticsService_1.AnalyticsService.generatePredictions({
            userId: req.user.userId,
            goalId: parseInt(req.params.goalId),
        });
        res.json({ success: true, data: predictions });
    }
    catch (error) {
        next(error);
    }
}));
// Öneriler
router.get("/recommendations", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(analyticValidation_1.recommendationSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recommendations = yield analyticsService_1.AnalyticsService.generateRecommendations({
            userId: req.user.userId,
            period: req.query.period
                ? parseInt(req.query.period)
                : undefined,
        });
        res.json({ success: true, data: recommendations });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
