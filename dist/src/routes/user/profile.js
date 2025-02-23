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
const profileService_1 = require("../../services/profileService");
const requestValidator_1 = require("../../middleware/requestValidator");
const profileValidator_1 = require("../../validations/profileValidator");
const multer_1 = __importDefault(require("multer"));
const exception_1 = require("../../domain/exception");
const s3_1 = require("src/helpers/s3");
/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     tags:
 *       - User
 *     summary: Kullanıcı profili görüntüleme
 *     description: Giriş yapmış kullanıcının profil bilgilerini getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *       401:
 *         description: Yetkilendirme hatası
 *
 *   put:
 *     tags:
 *       - User
 *     summary: Profil güncelleme
 *     description: Kullanıcı profil bilgilerini günceller
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 */
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Profil bilgilerini getir
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield profileService_1.ProfileService.getProfile(req.user.userId);
        res.json(profile);
    }
    catch (error) {
        next(error);
    }
}));
// Profil bilgilerini güncelle
router.put("/", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(profileValidator_1.updateProfileSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedProfile = yield profileService_1.ProfileService.updateProfile(req.user.userId, req.body);
        res.json(updatedProfile);
    }
    catch (error) {
        next(error);
    }
}));
// Avatar yükle/güncelle
router.post("/avatar", auth_1.authenticateToken, upload.single("avatar"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            throw new exception_1.BusinessException("Dosya yüklenmedi", 400);
        }
        const avatarUrl = yield (0, s3_1.uploadToS3)(req.file, req.user.userId.toString());
        const updatedProfile = yield profileService_1.ProfileService.updateAvatar(req.user.userId, avatarUrl);
        res.json(updatedProfile);
    }
    catch (error) {
        next(error);
    }
}));
// Avatar sil
router.delete("/avatar", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedProfile = yield profileService_1.ProfileService.deleteAvatar(req.user.userId);
        res.json(updatedProfile);
    }
    catch (error) {
        next(error);
    }
}));
// Şifre değiştir
router.put("/change-password", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(profileValidator_1.changePasswordSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield profileService_1.ProfileService.changePassword(req.user.userId, req.body);
        res.json({ message: "Şifre başarıyla güncellendi" });
    }
    catch (error) {
        next(error);
    }
}));
// Kullanıcı tercihlerini getir
router.get("/preferences", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const preferences = yield profileService_1.ProfileService.getPreferences(req.user.userId);
        res.json(preferences);
    }
    catch (error) {
        next(error);
    }
}));
// Kullanıcı tercihlerini güncelle
router.put("/preferences", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(profileValidator_1.updatePreferencesSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedPreferences = yield profileService_1.ProfileService.updatePreferences(req.user.userId, req.body);
        res.json(updatedPreferences);
    }
    catch (error) {
        next(error);
    }
}));
// Hesabı sil
router.delete("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield profileService_1.ProfileService.deleteAccount(req.user.userId);
        res.json({ message: "Hesap başarıyla silindi" });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
