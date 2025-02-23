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
const express_1 = __importDefault(require("express"));
const chatService_1 = require("../services/chatService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const rateLimiter_1 = require("../middleware/rateLimiter");
const chat_1 = require("../schemas/chat");
const mediaService_1 = require("../services/mediaService");
const zod_1 = require("zod");
/**
 * @swagger
 * /api/chat:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Sohbet listesini getir
 *     description: Kullanıcının tüm sohbetlerini listeler
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sohbet listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         name:
 *                           type: string
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                   unreadCount:
 *                     type: number
 *
 * /api/chat/{chatId}/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Sohbet mesajlarını getir
 *     description: Belirli bir sohbetin mesajlarını getirir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: Mesajlar başarıyla getirildi
 *
 *   post:
 *     tags:
 *       - Chat
 *     summary: Mesaj gönder
 *     description: Sohbete yeni mesaj gönderir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Mesaj başarıyla gönderildi
 *
 * /api/chat/{chatId}/read:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Mesajları okundu işaretle
 *     description: Sohbetteki okunmamış mesajları okundu olarak işaretler
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Mesajlar okundu olarak işaretlendi
 */
const router = express_1.default.Router();
// Yeni chat oluştur
router.post("/", auth_1.authenticateToken, rateLimiter_1.chatLimiter, (0, requestValidator_1.requestValidator)(chat_1.createChatSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield chatService_1.ChatService.createChat([
            req.user.userId,
            ...req.body.participantIds,
        ]);
        res.status(201).json({ success: true, data: chat });
    }
    catch (error) {
        next(error);
    }
}));
// Mesaj gönder
router.post("/:chatId/messages", auth_1.authenticateToken, rateLimiter_1.chatLimiter, (0, requestValidator_1.requestValidator)(chat_1.sendMessageSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield chatService_1.ChatService.sendMessage(req.params.chatId, req.user.userId, req.body, req.io);
        res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        next(error);
    }
}));
// Mesajları getir
router.get("/:chatId/messages", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(chat_1.getMessagesSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield chatService_1.ChatService.getMessages(req.params.chatId, req.user.userId, req.query);
        res.json(Object.assign({ success: true }, messages));
    }
    catch (error) {
        next(error);
    }
}));
// Mesajı okundu olarak işaretle
router.post("/messages/:messageId/read", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messageRead = yield chatService_1.ChatService.markMessageAsRead(req.params.messageId, req.user.userId, req.io);
        res.status(201).json({ success: true, data: messageRead });
    }
    catch (error) {
        next(error);
    }
}));
// Kullanıcının chatlerini getir
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chatService_1.ChatService.getUserChats(req.user.userId);
        res.json({ success: true, data: chats });
    }
    catch (error) {
        next(error);
    }
}));
// Medya yükleme URL'i al
router.post("/upload-url", auth_1.authenticateToken, rateLimiter_1.chatLimiter, (0, requestValidator_1.requestValidator)(zod_1.z.object({
    fileType: zod_1.z.string(),
    mediaType: zod_1.z.enum(["chat-images", "chat-files", "chat-audio"]),
})), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uploadUrl, fileUrl } = yield mediaService_1.MediaService.generateUploadUrl(req.body.fileType, req.body.mediaType);
        res.json({
            success: true,
            data: { uploadUrl, fileUrl },
        });
    }
    catch (error) {
        next(error);
    }
}));
// Validasyon şeması
const searchMessagesSchema = zod_1.z.object({
    searchTerm: zod_1.z.string().min(1, "Arama terimi gerekli"),
    chatId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20)),
});
// Mesaj arama
router.get("/messages/search", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(searchMessagesSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield chatService_1.ChatService.searchMessages(req.user.userId, {
            searchTerm: req.query.searchTerm,
            chatId: req.query.chatId,
            startDate: req.query.startDate
                ? new Date(req.query.startDate)
                : undefined,
            endDate: req.query.endDate
                ? new Date(req.query.endDate)
                : undefined,
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
        });
        res.json(Object.assign({ success: true }, results));
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
