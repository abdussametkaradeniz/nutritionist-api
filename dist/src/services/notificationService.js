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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const email_1 = require("../helpers/email");
const pushNotification_1 = require("../helpers/pushNotification");
const client_1 = __importDefault(require("prisma/client"));
class NotificationService {
    static createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { userId, sendPush, sendEmail: shouldSendEmail } = data, notificationData = __rest(data, ["userId", "sendPush", "sendEmail"]);
            const notification = yield client_1.default.notification.create({
                data: Object.assign(Object.assign({}, notificationData), { user: { connect: { id: userId } } }),
            });
            try {
                if (sendPush) {
                    const user = yield client_1.default.user.findUnique({
                        where: { id: userId },
                        include: { preferences: true },
                    });
                    if ((_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.pushNotifications) {
                        yield (0, pushNotification_1.sendPushNotification)({
                            userId: userId,
                            title: data.title,
                            body: data.message,
                            data: data.data,
                        });
                    }
                }
                if (shouldSendEmail) {
                    const user = yield client_1.default.user.findUnique({
                        where: { id: userId },
                        include: { preferences: true },
                    });
                    if ((_b = user === null || user === void 0 ? void 0 : user.preferences) === null || _b === void 0 ? void 0 : _b.emailNotifications) {
                        yield (0, email_1.sendEmail)({
                            to: user.email,
                            subject: data.title,
                            text: data.message,
                            templateId: "notification",
                            templateData: Object.assign({ title: data.title, message: data.message }, data.data),
                        });
                    }
                }
            }
            catch (error) {
                console.error("Notification delivery error:", error);
            }
            return notification;
        });
    }
    static getUserNotifications(userId_1, page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page, limit, onlyUnread = false) {
            return yield client_1.default.notification.findMany({
                where: { userId, isRead: onlyUnread ? false : undefined },
                skip: ((page !== null && page !== void 0 ? page : 1) - 1) * (limit !== null && limit !== void 0 ? limit : 10),
                take: limit !== null && limit !== void 0 ? limit : 10,
            });
        });
    }
    static markAsRead(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.notification.updateMany({
                where: { id, userId },
                data: { isRead: true, readAt: new Date() },
            });
        });
    }
    static markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true, readAt: new Date() },
            });
        });
    }
    static getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.notification.count({
                where: { userId, isRead: false },
            });
        });
    }
    static deleteNotification(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.notification.deleteMany({
                where: { id, userId },
            });
        });
    }
}
exports.NotificationService = NotificationService;
