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
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const exception_1 = require("../domain/exception");
const prisma = new client_1.PrismaClient();
class TokenService {
    // Access token oluşturma
    static generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            username: user.username,
            dietitianId: user.dietitianId,
            roles: user.roles || [],
            permissions: user.permissions || [],
        }, this.ACCESS_TOKEN_SECRET, { expiresIn: "15m" } // Access token 15 dakika geçerli
        );
    }
    // Refresh token oluşturma
    static generateRefreshToken(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = crypto_1.default.randomBytes(40).toString("hex");
            yield prisma.refreshToken.create({
                data: {
                    token,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
                    lastUpdatingUser: user.username,
                    lastUpdateDate: new Date(),
                },
            });
            return token;
        });
    }
    // Refresh token doğrulama ve yeni access token oluşturma
    static refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenDoc = yield prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken,
                    isRevoked: false,
                    expiresAt: { gt: new Date() },
                    recordStatus: "A",
                },
                include: {
                    user: true,
                },
            });
            if (!tokenDoc) {
                throw new exception_1.BusinessException("Invalid or expired refresh token", 401);
            }
            return this.generateAccessToken(tokenDoc.user);
        });
    }
    // Refresh token'ı geçersiz kılma (logout için)
    static revokeRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.refreshToken.updateMany({
                where: { token },
                data: {
                    isRevoked: true,
                    lastUpdateDate: new Date(),
                    lastUpdatingUser: "SYSTEM",
                },
            });
        });
    }
    // Kullanıcının tüm refresh token'larını geçersiz kılma
    static revokeAllUserTokens(userId, username) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.refreshToken.updateMany({
                where: {
                    userId,
                    isRevoked: false,
                    recordStatus: "A",
                },
                data: {
                    isRevoked: true,
                    lastUpdatingUser: username,
                    lastUpdateDate: new Date(),
                },
            });
        });
    }
    static revokeAllUserRefreshTokens(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.refreshToken.updateMany({
                where: { userId },
                data: {
                    isRevoked: true,
                    lastUpdateDate: new Date(),
                    lastUpdatingUser: "SYSTEM",
                },
            });
        });
    }
}
exports.TokenService = TokenService;
TokenService.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "your-secret-key";
TokenService.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";
