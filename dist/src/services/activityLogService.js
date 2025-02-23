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
exports.ActivityLogService = void 0;
const activityLogRepository_1 = require("../repositories/activityLogRepository");
const exception_1 = require("../domain/exception");
class ActivityLogService {
    static logActivity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield activityLogRepository_1.ActivityLogRepository.create(data);
        });
    }
    static getActivityById(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield activityLogRepository_1.ActivityLogRepository.findById(id, userId);
        });
    }
    static getUserActivities(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            return yield activityLogRepository_1.ActivityLogRepository.findByUserId(userId, page, limit);
        });
    }
    static filterActivities(userId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedFilters = Object.assign({}, filters);
            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                if (isNaN(startDate.getTime())) {
                    throw new exception_1.BusinessException("Geçersiz başlangıç tarihi formatı", 400);
                }
                parsedFilters.startDate = startDate;
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                if (isNaN(endDate.getTime())) {
                    throw new exception_1.BusinessException("Geçersiz bitiş tarihi formatı", 400);
                }
                parsedFilters.endDate = endDate;
            }
            if (parsedFilters.startDate &&
                parsedFilters.endDate &&
                parsedFilters.startDate > parsedFilters.endDate) {
                throw new exception_1.BusinessException("Başlangıç tarihi bitiş tarihinden büyük olamaz", 400);
            }
            return yield activityLogRepository_1.ActivityLogRepository.findWithFilters(userId, parsedFilters);
        });
    }
    // Yardımcı metodlar
    static logProfileUpdate(userId, changes, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.logActivity({
                userId,
                action: "PROFILE_UPDATE",
                details: { changes },
                ipAddress,
                userAgent,
            });
        });
    }
    static logPasswordChange(userId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.logActivity({
                userId,
                action: "PASSWORD_CHANGE",
                ipAddress,
                userAgent,
            });
        });
    }
    static logAvatarUpdate(userId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.logActivity({
                userId,
                action: "AVATAR_UPDATE",
                ipAddress,
                userAgent,
            });
        });
    }
    static logPreferencesUpdate(userId, changes, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.logActivity({
                userId,
                action: "PREFERENCES_UPDATE",
                details: { changes },
                ipAddress,
                userAgent,
            });
        });
    }
    static logAccountDeletion(userId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.logActivity({
                userId,
                action: "ACCOUNT_DELETION",
                ipAddress,
                userAgent,
            });
        });
    }
}
exports.ActivityLogService = ActivityLogService;
