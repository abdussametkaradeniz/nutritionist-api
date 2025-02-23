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
const reportService_1 = require("../services/reportService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const reportValidation_1 = require("src/validations/reportValidation");
const router = express_1.default.Router();
// Validasyon şemaları
// Özet raporu
router.get("/summary", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(reportValidation_1.dateRangeSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield reportService_1.ReportService.generateSummaryReport({
            userId: req.user.userId,
            startDate: new Date(req.query.startDate),
            endDate: new Date(req.query.endDate),
        });
        res.json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
}));
// Besin tüketim analizi
router.get("/nutrition", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(reportValidation_1.dateRangeSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield reportService_1.ReportService.generateNutritionReport({
            userId: req.user.userId,
            startDate: new Date(req.query.startDate),
            endDate: new Date(req.query.endDate),
        });
        res.json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
