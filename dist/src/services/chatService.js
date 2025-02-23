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
exports.ChatService = void 0;
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
const encryption_1 = require("../utils/encryption");
const exception_1 = require("../domain/exception");
class ChatService {
    static createChat(participantIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (participantIds.length < 2) {
                throw new exception_1.BusinessException("En az 2 katılımcı gerekli", 400);
            }
            const chat = yield client_2.default.chat.create({
                data: {
                    participants: {
                        create: participantIds.map((id) => ({
                            userId: id,
                        })),
                    },
                },
            });
            return chat;
        });
    }
    static sendMessage(chatId, userId, data, io) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const message = yield client_2.default.chatMessage.create({
                data: {
                    chatId,
                    senderId: userId,
                    content: data.content,
                    mediaUrl: (_a = data.attachments) === null || _a === void 0 ? void 0 : _a.join(", "), // Assuming attachments are URLs stored as comma-separated values
                    type: client_1.MessageType.TEXT, // Default type, adjust as necessary
                },
            });
            if (io) {
                io.to(chatId).emit("newMessage", message);
            }
            return message;
        });
    }
    static getMessages(chatId, userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield client_2.default.chatMessage.findMany({
                where: {
                    chatId,
                    createdAt: query.before ? { lt: query.before } : undefined,
                },
                take: query.limit,
                orderBy: {
                    createdAt: "desc",
                },
            });
            return messages;
        });
    }
    static markMessageAsRead(messageId, userId, io) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageRead = yield client_2.default.messageRead.upsert({
                where: {
                    messageId_userId: {
                        messageId,
                        userId,
                    },
                },
                update: {
                    readAt: new Date(),
                },
                create: {
                    messageId,
                    userId,
                    readAt: new Date(),
                },
            });
            if (io) {
                io.to(messageId).emit("messageRead", { messageId, userId });
            }
            return messageRead;
        });
    }
    static getUserChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chats = yield client_2.default.chat.findMany({
                where: {
                    participants: {
                        some: {
                            userId,
                        },
                    },
                },
                include: {
                    participants: true,
                    messages: true,
                },
            });
            return chats;
        });
    }
    static searchMessages(userId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = yield client_2.default.chatMessage.findMany({
                where: {
                    AND: [
                        { content: { contains: params.searchTerm } },
                        { chatId: params.chatId ? params.chatId : undefined },
                        {
                            createdAt: {
                                gte: params.startDate ? params.startDate : undefined,
                                lte: params.endDate ? params.endDate : undefined,
                            },
                        },
                    ],
                },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: {
                    createdAt: "desc",
                },
            });
            return messages;
        });
    }
    static sendEncryptedMessage(chatId, senderId, data, io) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            // Chat katılımcılarını bul
            const participants = yield client_2.default.chatParticipant.findMany({
                where: {
                    chatId,
                    leftAt: null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            publicKey: true,
                        },
                    },
                },
            });
            // Gönderen kullanıcıyı bul
            const sender = yield client_2.default.user.findUnique({
                where: { id: senderId },
                select: { privateKey: true },
            });
            if (!(sender === null || sender === void 0 ? void 0 : sender.privateKey)) {
                throw new appError_1.AppError("Gönderen kullanıcının şifreleme anahtarı yok", 400);
            }
            // Her alıcı için mesajı şifrele
            const encryptedMessages = participants
                .filter((p) => p.user.id !== senderId && p.user.publicKey)
                .map((p) => {
                const encrypted = encryption_1.E2EEncryption.encryptMessage(data.content, sender.privateKey, p.user.publicKey);
                return Object.assign({ recipientId: p.user.id }, encrypted);
            });
            // Mesajı kaydet
            const message = yield client_2.default.chatMessage.create({
                data: {
                    chatId,
                    senderId,
                    content: data.content,
                    type: data.type || client_1.MessageType.TEXT,
                    mediaUrl: data.mediaUrl,
                    isEncrypted: true,
                    encryptedContent: (_a = encryptedMessages[0]) === null || _a === void 0 ? void 0 : _a.encrypted,
                    nonce: (_b = encryptedMessages[0]) === null || _b === void 0 ? void 0 : _b.nonce,
                    ephemeralPublicKey: (_c = encryptedMessages[0]) === null || _c === void 0 ? void 0 : _c.ephemeralPublicKey,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            // Her alıcı için şifrelenmiş mesajı WebSocket ile gönder
            encryptedMessages.forEach((em) => {
                io.to(`user:${em.recipientId}`).emit("message:encrypted", Object.assign(Object.assign({}, message), { encrypted: em.encrypted, nonce: em.nonce, ephemeralPublicKey: em.ephemeralPublicKey }));
            });
            return message;
        });
    }
}
exports.ChatService = ChatService;
