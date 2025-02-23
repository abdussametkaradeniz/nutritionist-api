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
exports.EmailVerificationService = void 0;
const emailService_1 = require("./emailService");
const exception_1 = require("../domain/exception");
const crypto_1 = __importDefault(require("crypto"));
const emailVerificationRepository_1 = require("../repositories/emailVerificationRepository");
class EmailVerificationService {
    static sendVerificationEmail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Kullanıcının email durumunu kontrol et
            if (user.emailVerified) {
                throw new exception_1.BusinessException("Email zaten doğrulanmış", 400);
            }
            // Verification token oluştur
            const token = crypto_1.default.randomBytes(32).toString("hex");
            // Token'ı veritabanına kaydet
            yield emailVerificationRepository_1.EmailVerificationRepository.createVerificationToken({
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
            });
            // Doğrulama emaili gönder
            yield emailService_1.EmailService.sendVerificationEmail(user.email, token);
        });
    }
    static verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            // Token'ı kontrol et
            const verification = yield emailVerificationRepository_1.EmailVerificationRepository.getVerificationToken(token);
            if (!verification || !verification.user) {
                throw new exception_1.BusinessException("Geçersiz veya süresi dolmuş doğrulama kodu", 400);
            }
            // Email'i doğrulanmış olarak işaretle
            yield emailVerificationRepository_1.EmailVerificationRepository.markEmailAsVerified(verification.user.id);
        });
    }
    static resendVerificationEmail(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Son 5 dakika içinde gönderilmiş bir email var mı kontrol et
            const lastVerification = yield emailVerificationRepository_1.EmailVerificationRepository.getLastVerificationRequest(user.id);
            if (lastVerification &&
                new Date().getTime() - lastVerification.createdAt.getTime() <
                    5 * 60 * 1000) {
                throw new exception_1.BusinessException("Çok sık deneme yapıyorsunuz. Lütfen 5 dakika bekleyin.", 429);
            }
            // Yeni doğrulama emaili gönder
            yield this.sendVerificationEmail(user);
        });
    }
}
exports.EmailVerificationService = EmailVerificationService;
