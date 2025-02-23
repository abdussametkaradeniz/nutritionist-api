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
exports.EmailVerificationRepository = void 0;
const client_1 = require("@prisma/client");
class EmailVerificationRepository {
    static createVerificationToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.emailVerification.create({
                data: Object.assign(Object.assign({}, data), { lastUpdatingUser: data.userId.toString() }),
            });
        });
    }
    static getVerificationToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.emailVerification.findFirst({
                where: { token },
                include: { user: true },
            });
        });
    }
    static getLastVerificationRequest(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.emailVerification.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    static markEmailAsVerified(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.user.update({
                where: { id: userId },
                data: { emailVerified: true },
            });
        });
    }
}
exports.EmailVerificationRepository = EmailVerificationRepository;
EmailVerificationRepository.prisma = new client_1.PrismaClient();
