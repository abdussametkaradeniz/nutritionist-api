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
exports.ProfileService = void 0;
const exception_1 = require("../domain/exception");
const password_1 = require("../helpers/password");
const s3_1 = require("../helpers/s3");
const profileRepository_1 = require("../repositories/profileRepository");
class ProfileService {
    static getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profileRepository_1.ProfileRepository.getProfile(userId);
        });
    }
    static updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profileRepository_1.ProfileRepository.updateProfile(userId, data);
        });
    }
    static updatePreferences(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profileRepository_1.ProfileRepository.updatePreferences(userId, data);
        });
    }
    static changePassword(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield profileRepository_1.ProfileRepository.getProfile(userId);
            const isValidPassword = yield (0, password_1.comparePassword)(data.currentPassword, user.passwordHash);
            if (!isValidPassword) {
                throw new exception_1.BusinessException("Mevcut şifre yanlış", 400);
            }
            if (data.newPassword !== data.confirmPassword) {
                throw new exception_1.BusinessException("Yeni şifreler eşleşmiyor", 400);
            }
            if (data.currentPassword === data.newPassword) {
                throw new exception_1.BusinessException("Yeni şifre mevcut şifre ile aynı olamaz", 400);
            }
            const newPasswordHash = yield (0, password_1.hashPassword)(data.newPassword);
            return yield profileRepository_1.ProfileRepository.updateProfile(userId, {
                passwordHash: newPasswordHash,
            });
        });
    }
    static updateAvatar(userId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Avatar boyut kontrolü
            if (file.size > 5 * 1024 * 1024) {
                // 5MB
                throw new exception_1.BusinessException("Avatar boyutu 5MB'dan büyük olamaz", 400);
            }
            // Dosya tipi kontrolü
            if (!file.mimetype.startsWith("image/")) {
                throw new exception_1.BusinessException("Geçersiz dosya tipi", 400);
            }
            const avatarUrl = yield (0, s3_1.uploadToS3)(file, `avatars/${userId}`);
            return yield profileRepository_1.ProfileRepository.updateAvatar(userId, avatarUrl);
        });
    }
    static deleteAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield profileRepository_1.ProfileRepository.getProfile(userId);
            if (user.avatarUrl) {
                yield (0, s3_1.deleteFromS3)(user.avatarUrl);
            }
            return yield profileRepository_1.ProfileRepository.deleteAvatar(userId);
        });
    }
    static deleteAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Avatar varsa sil
            const user = yield profileRepository_1.ProfileRepository.getProfile(userId);
            if (user.avatarUrl) {
                yield (0, s3_1.deleteFromS3)(user.avatarUrl);
            }
            return yield profileRepository_1.ProfileRepository.deleteAccount(userId);
        });
    }
    static getPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = yield profileRepository_1.ProfileRepository.getPreferences(userId);
            return preferences !== null && preferences !== void 0 ? preferences : {};
        });
    }
}
exports.ProfileService = ProfileService;
