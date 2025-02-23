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
exports.NotificationRepository = void 0;
const client_1 = require("@prisma/client");
class NotificationRepository {
    static createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.notification.create({
                data,
            });
        });
    }
    static getUserNotifications(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10, onlyUnread = false) {
            return yield this.prisma.notification.findMany({
                where: Object.assign({ userId }, (onlyUnread ? { read: false } : {})),
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
            });
        });
    }
    static markAsRead(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.notification.update({
                where: { id, userId },
                data: {
                    isRead: true,
                    lastUpdatingUser: userId.toString(),
                },
            });
        });
    }
    static markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: {
                    isRead: true,
                    lastUpdatingUser: userId.toString(),
                },
            });
        });
    }
    static getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
        });
    }
    static deleteNotification(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.notification.delete({
                where: { id, userId },
            });
        });
    }
    static getUserWithPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true },
            });
        });
    }
}
exports.NotificationRepository = NotificationRepository;
NotificationRepository.prisma = new client_1.PrismaClient();
