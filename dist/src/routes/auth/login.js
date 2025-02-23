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
const loginValidator_1 = require("../../validations/auth/loginValidator");
const requestValidator_1 = require("../../middleware/requestValidator");
const client_1 = require("@prisma/client");
const tokenService_1 = require("../../services/tokenService");
const sessionService_1 = require("../../services/sessionService");
const exception_1 = require("../../domain/exception");
const password_1 = require("../../helpers/password");
const speakeasy_1 = __importDefault(require("speakeasy"));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı girişi
 *     description: Email/username/telefon ve şifre ile kullanıcı girişi yapar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, username veya telefon numarası
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcı şifresi
 *               totpToken:
 *                 type: string
 *                 description: İki faktörlü doğrulama kodu (opsiyonel)
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token
 *                 sessionId:
 *                   type: string
 *                   description: Oturum ID
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       403:
 *         description: 2FA token gerekli
 *       429:
 *         description: Çok fazla deneme
 */
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const sessionService = new sessionService_1.SessionService();
router.post("/", (0, requestValidator_1.requestValidator)(loginValidator_1.loginSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, totpToken } = req.body;
        // Kullanıcıyı bul
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 404);
        }
        // Şifre kontrolü
        const isValidPassword = yield (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isValidPassword) {
            throw new exception_1.BusinessException("Geçersiz şifre", 401);
        }
        // 2FA kontrol
        if (user.twoFactorEnabled) {
            if (!totpToken) {
                return res.status(403).json({
                    requiresTwoFactor: true,
                    message: "Please provide 2FA token",
                });
            }
            const verified = speakeasy_1.default.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token: totpToken,
            });
            if (!verified) {
                return res.status(401).json({ error: "Invalid 2FA token" });
            }
        }
        // Access ve Refresh token oluştur
        const accessToken = tokenService_1.TokenService.generateAccessToken(user);
        const refreshToken = yield tokenService_1.TokenService.generateRefreshToken(user);
        // Session oluştur
        const sessionId = yield sessionService.createSession({
            userId: user.id,
            deviceId: req.headers["x-device-id"],
            deviceType: req.headers["x-device-type"],
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            accessToken,
            refreshToken,
            sessionId,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                dietitianId: user.dietitianId,
                twoFactorEnabled: user.twoFactorEnabled,
            },
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
