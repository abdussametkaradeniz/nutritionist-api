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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationRepository_1 = require("../repositories/notificationRepository");
const email_1 = require("../helpers/email");
const pushNotification_1 = require("../helpers/pushNotification");
class NotificationService {
    static createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { sendPush, sendEmail: shouldSendEmail } = data, notificationData = __rest(data, ["sendPush", "sendEmail"]);
            const notification = yield notificationRepository_1.NotificationRepository.createNotification(notificationData);
            try {
                if (sendPush) {
                    const user = yield notificationRepository_1.NotificationRepository.getUserWithPreferences(data.userId);
                    if ((_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.pushNotifications) {
                        yield (0, pushNotification_1.sendPushNotification)({
                            userId: data.userId,
                            title: data.title,
                            body: data.message,
                            data: data.data,
                        });
                    }
                }
                if (shouldSendEmail) {
                    const user = yield notificationRepository_1.NotificationRepository.getUserWithPreferences(data.userId);
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
            return yield notificationRepository_1.NotificationRepository.getUserNotifications(userId, page, limit, onlyUnread);
        });
    }
    static markAsRead(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationRepository_1.NotificationRepository.markAsRead(id, userId);
        });
    }
    static markAllAsRead(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationRepository_1.NotificationRepository.markAllAsRead(userId);
        });
    }
    static getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationRepository_1.NotificationRepository.getUnreadCount(userId);
        });
    }
    static deleteNotification(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationRepository_1.NotificationRepository.deleteNotification(id, userId);
        });
    }
    // Helper methods
    static sendAppointmentNotification(userId, appointmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createNotification({
                userId,
                title: "Yeni Randevu",
                message: `${appointmentData.date} tarihinde randevunuz var.`,
                type: "APPOINTMENT",
                data: appointmentData,
                sendPush: true,
                sendEmail: true,
            });
        });
    }
    static sendMessageNotification(userId, messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createNotification({
                userId,
                title: "Yeni Mesaj",
                message: `${messageData.senderName}: ${messageData.preview}`,
                type: "MESSAGE",
                data: messageData,
                sendPush: true,
            });
        });
    }
    static sendSystemNotification(userId, title, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.createNotification({
                userId,
                title,
                message,
                type: "SYSTEM",
                data,
                sendPush: true,
                sendEmail: true,
            });
        });
    }
}
exports.NotificationService = NotificationService;
