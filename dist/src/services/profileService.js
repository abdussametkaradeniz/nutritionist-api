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
exports.ProfileService = void 0;
const password_1 = require("../helpers/password");
const client_1 = __importDefault(require("prisma/client"));
class ProfileService {
    static getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true, // Profil bilgilerini de getir
                    preferences: true, // Kullanıcı tercihlerini de getir
                },
            });
        });
    }
    static updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.profile.update({
                where: { userId: userId },
                data: data,
            });
        });
    }
    static updatePreferences(userId, preferencesData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.userPreferences.update({
                where: { userId: userId },
                data: preferencesData,
            });
        });
    }
    static changePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const newPasswordHash = yield (0, password_1.hashPassword)(newPassword); // Yeni şifreyi hashle
            return yield client_1.default.user.update({
                where: { id: userId },
                data: { passwordHash: newPasswordHash },
            });
        });
    }
    static updateAvatar(userId, avatarUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.profile.update({
                where: { userId: userId },
                data: { photoUrl: avatarUrl },
            });
        });
    }
    static deleteAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.profile.update({
                where: { userId: userId },
                data: { photoUrl: null },
            });
        });
    }
    static deleteAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.user.delete({
                where: { id: userId },
            });
        });
    }
    static getPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.userPreferences.findUnique({
                where: { userId: userId },
            });
        });
    }
}
exports.ProfileService = ProfileService;
