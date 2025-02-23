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
exports.generateTokens = generateTokens;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.refreshAccessToken = refreshAccessToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../../prisma/client"));
const uuidv4_1 = require("uuidv4");
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
function generateTokens(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = generateAccessToken(user);
        const refreshToken = yield generateRefreshToken(user.id);
        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    });
}
function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN, // Örneğin 1 saat geçerlilik süresi
    });
}
function generateRefreshToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenFamily = (0, uuidv4_1.uuid)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
        // Save refresh token to database
        yield client_1.default.refreshToken.create({
            data: {
                userId,
                token: tokenFamily,
                expiresAt,
            },
        });
        return jsonwebtoken_1.default.sign({ tokenFamily }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });
    });
}
function refreshAccessToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            // Find refresh token in database
            const tokenData = yield client_1.default.refreshToken.findFirst({
                where: {
                    token: decoded.tokenFamily,
                    isRevoked: false,
                },
            });
            if (!tokenData) {
                return null;
            }
            // Get user data
            const user = yield client_1.default.user.findUnique({
                where: {
                    id: tokenData.userId,
                },
                include: {
                    role: true,
                },
            });
            if (!user) {
                return null;
            }
            // Revoke old refresh token
            yield client_1.default.refreshToken.update({
                where: {
                    id: tokenData.id,
                },
                data: {
                    isRevoked: true,
                },
            });
            // Generate new tokens
            return yield generateTokens(user);
        }
        catch (error) {
            return null;
        }
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
    }
    catch (error) {
        throw new Error("Invalid token");
    }
}
