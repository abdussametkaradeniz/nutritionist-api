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
exports.ProfileRepository = void 0;
const client_1 = require("@prisma/client");
class ProfileRepository {
    static getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                include: {
                    preferences: true,
                },
            });
        });
    }
    static getPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUniqueOrThrow({
                where: { id: userId },
                select: {
                    preferences: true,
                },
            });
            return user.preferences;
        });
    }
    static updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { id: userId },
                data,
            });
        });
    }
    static updatePreferences(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { id: userId },
                data: {
                    preferences: {
                        upsert: {
                            create: data,
                            update: data,
                        },
                    },
                },
            });
        });
    }
    static updateAvatar(userId, avatarUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { id: userId },
                data: { avatarUrl },
            });
        });
    }
    static deleteAvatar(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { id: userId },
                data: { avatarUrl: null },
            });
        });
    }
    static deleteAccount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.delete({
                where: { id: userId },
            });
        });
    }
}
exports.ProfileRepository = ProfileRepository;
ProfileRepository.prisma = new client_1.PrismaClient();
