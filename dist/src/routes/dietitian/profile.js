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
const dietitianService_1 = require("../../services/dietitianService");
const auth_1 = require("../../middleware/auth");
const validateDietitian_1 = require("../../middleware/validateDietitian");
const validateProfileCompletion_1 = require("../../middleware/validateProfileCompletion");
const requestValidator_1 = require("../../middleware/requestValidator");
const dietitian_1 = require("../../schemas/dietitian");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const zod_1 = require("zod");
const appError_1 = require("../../utils/appError");
const client_1 = require("@prisma/client");
const role_model_1 = require("../../models/role.model");
const rbac_1 = require("../../middleware/rbac");
const sentry_1 = require("../../config/sentry");
const router = express_1.default.Router();
// Helper function to validate Specialization enum values
const isValidSpecialization = (value) => {
    return Object.values(client_1.Specialization).includes(value);
};
// Profil işlemleri
router.post("/", auth_1.authenticateToken, (0, rbac_1.hasRole)([role_model_1.Role.DIETITIAN]), (0, rbac_1.hasPermission)([role_model_1.Permission.UPDATE_PROFILE]), rateLimiter_1.dietitianProfileLimiter, (0, requestValidator_1.requestValidator)(dietitian_1.dietitianProfileSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const profile = yield dietitianService_1.DietitianService.createProfile(req.user.userId, req.body);
        res.status(201).json({ success: true, data: profile });
    }
    catch (error) {
        (0, sentry_1.captureException)(error, {
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
            path: req.path,
            method: req.method,
        });
        next(error);
    }
}));
router.get("/", auth_1.authenticateToken, (0, rbac_1.hasRole)([role_model_1.Role.DIETITIAN]), (0, rbac_1.hasPermission)([role_model_1.Permission.READ_PROFILE]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield dietitianService_1.DietitianService.getProfile(req.user.userId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        next(error);
    }
}));
router.put("/", auth_1.authenticateToken, (0, rbac_1.hasRole)([role_model_1.Role.DIETITIAN]), (0, rbac_1.hasPermission)([role_model_1.Permission.UPDATE_PROFILE]), (0, requestValidator_1.requestValidator)(dietitian_1.dietitianProfileSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield dietitianService_1.DietitianService.updateProfile(req.user.userId, req.body);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        next(error);
    }
}));
// Uzmanlık alanları
router.post("/specialties/:specialtyId", auth_1.authenticateToken, (0, rbac_1.hasRole)([role_model_1.Role.DIETITIAN]), (0, rbac_1.hasPermission)([role_model_1.Permission.UPDATE_PROFILE]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specialtyId = req.params.specialtyId;
        if (!isValidSpecialization(specialtyId)) {
            throw new appError_1.AppError(`Invalid specialization value: ${specialtyId}`, 400);
        }
        const specialty = yield dietitianService_1.DietitianService.addSpecialty(req.user.userId, specialtyId);
        res.json({ success: true, data: specialty });
    }
    catch (error) {
        next(error);
    }
}));
router.delete("/specialties/:specialtyId", auth_1.authenticateToken, (0, rbac_1.hasRole)([role_model_1.Role.DIETITIAN]), (0, rbac_1.hasPermission)([role_model_1.Permission.UPDATE_PROFILE]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specialtyId = req.params.specialtyId;
        if (!isValidSpecialization(specialtyId)) {
            throw new appError_1.AppError(`Invalid specialization value: ${specialtyId}`, 400);
        }
        yield dietitianService_1.DietitianService.removeSpecialty(req.user.userId, specialtyId);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
}));
// Çalışma saatleri
router.post("/schedule", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (0, requestValidator_1.requestValidator)(dietitian_1.workingHoursSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield dietitianService_1.DietitianService.addWorkingHours(req.user.userId, req.body);
    res.json({ success: true, data: schedule });
}));
router.put("/schedule/:id", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (0, requestValidator_1.requestValidator)(dietitian_1.workingHoursSchema.partial()), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield dietitianService_1.DietitianService.updateWorkingHours(req.user.userId, req.body);
    res.json({ success: true, data: schedule });
}));
router.delete("/schedule/:id", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    yield dietitianService_1.DietitianService.deleteWorkingHours(req.user.userId, id);
    res.json({ success: true });
}));
// Çalışma Saatleri
router.put("/working-hours", auth_1.authenticateToken, validateDietitian_1.validateDietitian, validateProfileCompletion_1.validateProfileCompletion, rateLimiter_1.workingHoursLimiter, (0, requestValidator_1.requestValidator)(zod_1.z.array(dietitian_1.workingHoursSchema)), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hours = yield dietitianService_1.DietitianService.updateWorkingHours(req.user.userId, req.body);
        res.json({ success: true, data: hours });
    }
    catch (error) {
        next(error);
    }
}));
// Fiyatlandırma Paketleri
router.post("/packages", auth_1.authenticateToken, validateDietitian_1.validateDietitian, validateProfileCompletion_1.validateProfileCompletion, rateLimiter_1.pricingLimiter, (0, requestValidator_1.requestValidator)(dietitian_1.pricingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packageData = yield dietitianService_1.DietitianService.createPricingPackage(req.user.userId, req.body);
        res.status(201).json({ success: true, data: packageData });
    }
    catch (error) {
        next(error);
    }
}));
router.put("/packages/:id", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (0, requestValidator_1.requestValidator)(dietitian_1.pricingSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packageData = yield dietitianService_1.DietitianService.updatePricingPackage(req.user.userId, req.params.id, req.body);
        res.json({ success: true, data: packageData });
    }
    catch (error) {
        next(error);
    }
}));
router.delete("/packages/:id", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dietitianService_1.DietitianService.deletePricingPackage(req.user.userId, req.params.id);
        res.json({ success: true, message: "Package deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/packages", auth_1.authenticateToken, validateDietitian_1.validateDietitian, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packages = yield dietitianService_1.DietitianService.getPricingPackages(req.user.userId);
        res.json({ success: true, data: packages });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
