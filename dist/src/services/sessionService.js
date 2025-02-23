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
exports.SessionService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const exception_1 = require("../domain/exception");
class SessionService {
    createSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.session.create({
                data: {
                    userId: data.userId,
                    deviceId: data.deviceId,
                    deviceType: data.deviceType,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    isActive: true,
                    dietitianId: data.dietitianId,
                },
            });
        });
    }
    getSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield client_1.default.session.findUnique({
                where: { id: sessionId },
            });
            if (!session) {
                throw new exception_1.BusinessException("Session not found", 404);
            }
            return session;
        });
    }
    static getUserSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.session.findMany({
                where: {
                    userId,
                    isActive: true,
                },
                select: {
                    id: true,
                    deviceId: true,
                    deviceType: true,
                    lastActivity: true,
                    isActive: true,
                },
            });
        });
    }
    updateSession(sessionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Session'ın varlığını kontrol et
            yield this.getSession(sessionId);
            return yield client_1.default.session.update({
                where: { id: sessionId },
                data: {
                    deviceId: data.deviceId,
                    deviceType: data.deviceType,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    lastActivity: new Date(),
                    isActive: data.isActive,
                },
            });
        });
    }
    deactivateSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Session'ın varlığını kontrol et
            yield this.getSession(sessionId);
            return yield client_1.default.session.update({
                where: { id: sessionId },
                data: {
                    isActive: false,
                    lastActivity: new Date(),
                },
            });
        });
    }
    deactivateUserSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.session.updateMany({
                where: {
                    userId,
                    isActive: true,
                },
                data: {
                    isActive: false,
                    lastActivity: new Date(),
                },
            });
        });
    }
    cleanupInactiveSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return yield client_1.default.session.deleteMany({
                where: {
                    OR: [{ isActive: false }, { lastActivity: { lt: thirtyDaysAgo } }],
                },
            });
        });
    }
    static deactivateSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.session.update({
                where: { id: sessionId },
                data: { isActive: false },
            });
        });
    }
    static deactivateAllSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.session.updateMany({
                where: {
                    userId,
                    isActive: true,
                },
                data: { isActive: false },
            });
        });
    }
}
exports.SessionService = SessionService;
