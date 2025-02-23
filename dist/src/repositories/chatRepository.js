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
exports.ChatRepository = void 0;
const client_1 = require("@prisma/client");
class ChatRepository {
    static createChat(participantIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chat.create({
                data: {
                    participants: {
                        create: participantIds.map((userId) => ({
                            userId,
                        })),
                    },
                },
                include: {
                    participants: true,
                },
            });
        });
    }
    static sendMessage(chatId, userId, content, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chatMessage.create({
                data: {
                    chatId,
                    senderId: userId,
                    content,
                    mediaUrl: attachments === null || attachments === void 0 ? void 0 : attachments[0],
                    type: attachments ? "FILE" : "TEXT",
                },
                include: {
                    sender: true,
                },
            });
        });
    }
    static getMessages(chatId, userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { before, limit = 50 } = query;
            return yield this.prisma.chatMessage.findMany({
                where: Object.assign({ chatId }, (before ? { createdAt: { lt: before } } : {})),
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    sender: true,
                },
            });
        });
    }
    static markMessageAsRead(messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.messageRead.create({
                data: {
                    messageId,
                    userId,
                },
            });
        });
    }
    static getUserChats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.chat.findMany({
                where: {
                    participants: {
                        some: { userId },
                    },
                },
                include: {
                    participants: true,
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            });
        });
    }
    static searchMessages(userId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchTerm, chatId, startDate, endDate, page, limit } = params;
            return yield this.prisma.chatMessage.findMany({
                where: {
                    content: { contains: searchTerm },
                    chatId: chatId,
                    senderId: userId,
                    createdAt: Object.assign(Object.assign({}, (startDate ? { gte: startDate } : {})), (endDate ? { lte: endDate } : {})),
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    sender: true,
                },
            });
        });
    }
}
exports.ChatRepository = ChatRepository;
ChatRepository.prisma = new client_1.PrismaClient();
