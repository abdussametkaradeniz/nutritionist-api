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
exports.PasswordResetService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const emailService_1 = require("./emailService");
const exception_1 = require("../domain/exception");
class PasswordResetService {
    constructor() {
        this.emailService = new emailService_1.EmailService();
    }
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new exception_1.NotFound("User not found");
            }
            const token = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli
            yield client_1.default.passwordReset.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt,
                },
            });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            yield this.emailService.sendPasswordResetEmail(email, resetLink);
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = yield client_1.default.passwordReset.findFirst({
                where: {
                    token,
                    used: false,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!resetToken) {
                throw new exception_1.InvalidParameter("Invalid or expired reset token");
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield client_1.default.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash: hashedPassword },
            });
            yield client_1.default.passwordReset.update({
                where: { id: resetToken.id },
                data: { used: true },
            });
        });
    }
}
exports.PasswordResetService = PasswordResetService;
