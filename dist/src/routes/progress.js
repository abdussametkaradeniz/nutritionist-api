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
const progressService_1 = require("../services/progressService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const multer_1 = __importDefault(require("multer"));
const progressValidation_1 = require("src/validations/progressValidation");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
// İlerleme kaydı oluştur
router.post("/", auth_1.authenticateToken, upload.array("photos"), (0, requestValidator_1.requestValidator)(progressValidation_1.createProgressSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const photos = (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => ({
            file,
            type: req.body[`photoTypes[${file.fieldname}]`] || "front",
        }));
        const progress = yield progressService_1.ProgressService.createProgress(req.user.userId, Object.assign(Object.assign({}, req.body), { date: new Date(req.body.date), photos }));
        res.status(201).json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
}));
// İlerleme kayıtlarını listele
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield progressService_1.ProgressService.getProgress({
            userId: req.user.userId,
            startDate: req.query.startDate
                ? new Date(req.query.startDate)
                : undefined,
            endDate: req.query.endDate
                ? new Date(req.query.endDate)
                : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        res.json(Object.assign({ success: true }, progress));
    }
    catch (error) {
        next(error);
    }
}));
// İstatistikleri hesapla
router.get("/stats", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.startDate || !req.query.endDate) {
            throw new Error("Başlangıç ve bitiş tarihi gerekli");
        }
        const stats = yield progressService_1.ProgressService.calculateStats(req.user.userId, {
            startDate: new Date(req.query.startDate),
            endDate: new Date(req.query.endDate),
        });
        res.json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
