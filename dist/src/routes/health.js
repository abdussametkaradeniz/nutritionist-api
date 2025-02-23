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
const healthService_1 = require("../services/healthService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Validasyon şemaları
const connectSchema = zod_1.z.object({
    provider: zod_1.z.nativeEnum(client_1.HealthAppProvider),
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
});
const syncDataSchema = zod_1.z.object({
    provider: zod_1.z.nativeEnum(client_1.HealthAppProvider),
    data: zod_1.z.array(zod_1.z.object({
        dataType: zod_1.z.string(),
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        timestamp: zod_1.z.string().datetime(),
    })),
});
const getDataSchema = zod_1.z.object({
    dataType: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Sağlık uygulaması bağlantısı
router.post("/connect", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(connectSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield healthService_1.HealthService.connectHealthApp(Object.assign(Object.assign({ userId: req.user.userId }, req.body), (req.body.expiresAt && { expiresAt: new Date(req.body.expiresAt) })));
        res.status(201).json({ success: true, data: connection });
    }
    catch (error) {
        next(error);
    }
}));
// Sağlık verisi senkronizasyonu
router.post("/sync", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(syncDataSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const healthData = yield healthService_1.HealthService.syncHealthData({
            userId: req.user.userId,
            provider: req.body.provider,
            data: req.body.data.map((item) => (Object.assign(Object.assign({}, item), { timestamp: new Date(item.timestamp) }))),
        });
        res.json({ success: true, data: healthData });
    }
    catch (error) {
        next(error);
    }
}));
// Sağlık verilerini getir
router.get("/data", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(getDataSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const healthData = yield healthService_1.HealthService.getHealthData({
            userId: req.user.userId,
            dataType: req.query.dataType,
            startDate: req.query.startDate
                ? new Date(req.query.startDate)
                : undefined,
            endDate: req.query.endDate
                ? new Date(req.query.endDate)
                : undefined,
        });
        res.json({ success: true, data: healthData });
    }
    catch (error) {
        next(error);
    }
}));
// Bağlantıyı sil
router.delete("/disconnect/:provider", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(zod_1.z.object({
    provider: zod_1.z.nativeEnum(client_1.HealthAppProvider),
})), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield healthService_1.HealthService.disconnectHealthApp(req.user.userId, req.params.provider);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
