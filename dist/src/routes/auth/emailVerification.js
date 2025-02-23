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
const client_1 = require("@prisma/client");
const emailVerificationService_1 = require("../../services/emailVerificationService");
const exception_1 = require("../../domain/exception");
const auth_1 = require("../../middleware/auth");
/**
 * @swagger
 * /api/auth/email-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama isteği
 *     description: Kullanıcının email adresine doğrulama bağlantısı gönderir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Doğrulanacak email adresi
 *     responses:
 *       200:
 *         description: Doğrulama emaili gönderildi
 *       429:
 *         description: Çok fazla deneme
 *
 *   get:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama
 *     description: Email doğrulama token'ı ile hesabı doğrular
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email doğrulama token'ı
 *     responses:
 *       200:
 *         description: Email başarıyla doğrulandı
 *       400:
 *         description: Geçersiz veya süresi dolmuş token
 *       404:
 *         description: Token bulunamadı
 *
 *   put:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama token'ı yenileme
 *     description: Süresi dolmuş email doğrulama token'ını yeniler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Doğrulanacak email adresi
 *     responses:
 *       200:
 *         description: Yeni doğrulama emaili gönderildi
 *       429:
 *         description: Çok fazla deneme
 */
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const sendVerificationHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 401);
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 404);
        }
        if (user.emailVerified) {
            throw new exception_1.BusinessException("Email zaten doğrulanmış", 400);
        }
        // Email verification service'i kullan
        yield emailVerificationService_1.EmailVerificationService.sendVerificationEmail(user);
        const response = {
            message: "Doğrulama emaili gönderildi",
            status: "success",
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
});
router.post("/send", auth_1.authenticateToken, sendVerificationHandler);
// Email doğrulama
router.post("/verify", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            throw new exception_1.BusinessException("Token gerekli", 400);
        }
        yield emailVerificationService_1.EmailVerificationService.verifyEmail(token);
        const response = {
            message: "Email başarıyla doğrulandı",
            status: "success",
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Email doğrulama durumunu kontrol et
router.get("/status", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 401);
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true },
        });
        if (!user) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 404);
        }
        const response = {
            verified: user.emailVerified,
            message: user.emailVerified ? "Email doğrulanmış" : "Email doğrulanmamış",
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
