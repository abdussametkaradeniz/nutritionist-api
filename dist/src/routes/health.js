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
const healthValidation_1 = require("src/validations/healthValidation");
const router = express_1.default.Router();
// Sağlık uygulaması bağlantısı
router.post("/connect", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(healthValidation_1.connectSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield healthService_1.HealthService.connectHealthApp(Object.assign(Object.assign({ userId: req.user.userId }, req.body), (req.body.expiresAt && { expiresAt: new Date(req.body.expiresAt) })));
        res.status(201).json({ success: true, data: connection });
    }
    catch (error) {
        next(error);
    }
}));
// Sağlık verisi senkronizasyonu
router.post("/sync", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(healthValidation_1.syncDataSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
router.get("/data", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(healthValidation_1.getDataSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
