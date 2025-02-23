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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionMiddleware = void 0;
const sessionService_1 = require("../services/sessionService");
const sessionMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next();
        }
        // Session oluştur veya güncelle
        const sessionId = req.cookies["sessionId"];
        if (sessionId) {
            // Mevcut session'ı güncelle
            yield sessionService_1.SessionService.updateSession(sessionId, {
                lastActivity: new Date(),
            });
        }
        else {
            // Yeni session oluştur
            const session = yield sessionService_1.SessionService.createSession({
                userId: req.user.userId,
                deviceId: req.headers["x-device-id"],
                deviceType: req.headers["x-device-type"],
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            // Session ID'yi cookie olarak kaydet
            res.cookie("sessionId", session.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.sessionMiddleware = sessionMiddleware;
