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
exports.validateProfileCompletion = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
const validateProfileCompletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new appError_1.AppError("Unauthorized", 401);
        }
        const profile = yield client_1.default.dietitianProfile.findUnique({
            where: { userId },
            select: {
                bio: true,
                education: true,
                experience: true,
                specializations: true,
                certificates: true,
                workingHours: true,
                pricingPackages: true,
            },
        });
        if (!profile) {
            throw new appError_1.AppError("Diyetisyen profili bulunamadı", 404);
        }
        // Zorunlu alanların kontrolü
        const isProfileComplete = profile.bio &&
            profile.education.length > 0 &&
            profile.experience > 0 &&
            profile.specializations.length > 0 &&
            profile.workingHours.length > 0 &&
            profile.pricingPackages.length > 0;
        if (!isProfileComplete) {
            throw new appError_1.AppError("Lütfen profilinizi tamamlayın. Eksik alanlar: " +
                [
                    !profile.bio && "Biyografi",
                    profile.education.length === 0 && "Eğitim bilgileri",
                    profile.experience === 0 && "Deneyim",
                    profile.specializations.length === 0 && "Uzmanlık alanları",
                    profile.workingHours.length === 0 && "Çalışma saatleri",
                    profile.pricingPackages.length === 0 && "Fiyatlandırma paketleri",
                ]
                    .filter(Boolean)
                    .join(", "), 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateProfileCompletion = validateProfileCompletion;
