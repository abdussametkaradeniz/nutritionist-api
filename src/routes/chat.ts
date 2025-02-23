import express, { Response, NextFunction, Request } from "express";
import { ChatService } from "../services/chatService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { chatLimiter } from "../middleware/rateLimiter";
import {
  createChatSchema,
  getMessagesSchema,
  sendMessageSchema,
} from "../validations/chat";
import { MediaService } from "../services/mediaService";
import { z } from "zod";
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
const router = express.Router();

// Yeni chat oluştur
router.post(
  "/",
  authenticateToken,
  chatLimiter,
  requestValidator(createChatSchema),
  async (req, res, next) => {
    try {
      const chat = await ChatService.createChat([
        req.user!.userId,
        ...req.body.participantIds,
      ]);
      res.status(201).json({ success: true, data: chat });
    } catch (error) {
      next(error);
    }
  }
);

// Mesaj gönder
router.post(
  "/:chatId/messages",
  authenticateToken,
  chatLimiter,
  requestValidator(sendMessageSchema),
  async (req, res, next) => {
    try {
      const message = await ChatService.sendMessage(
        req.params.chatId,
        req.user!.userId,
        req.body,
        req.io
      );
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }
);

// Mesajları getir
router.get(
  "/:chatId/messages",
  authenticateToken,
  requestValidator(getMessagesSchema),
  async (req, res, next) => {
    try {
      const messages = await ChatService.getMessages(
        req.params.chatId,
        req.user!.userId,
        req.query
      );
      res.json({ success: true, ...messages });
    } catch (error) {
      next(error);
    }
  }
);

// Mesajı okundu olarak işaretle
router.post(
  "/messages/:messageId/read",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messageRead = await ChatService.markMessageAsRead(
        req.params.messageId,
        req.user!.userId,
        req.io
      );
      res.status(201).json({ success: true, data: messageRead });
    } catch (error) {
      next(error);
    }
  }
);

// Kullanıcının chatlerini getir
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const chats = await ChatService.getUserChats(req.user!.userId);
    res.json({ success: true, data: chats });
  } catch (error) {
    next(error);
  }
});

// Medya yükleme URL'i al
router.post(
  "/upload-url",
  authenticateToken,
  chatLimiter,
  requestValidator(
    z.object({
      fileType: z.string(),
      mediaType: z.enum(["chat-images", "chat-files", "chat-audio"]),
    })
  ),
  async (req, res, next) => {
    try {
      const { uploadUrl, fileUrl } = await MediaService.generateUploadUrl(
        req.body.fileType,
        req.body.mediaType
      );

      res.json({
        success: true,
        data: { uploadUrl, fileUrl },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Validasyon şeması
const searchMessagesSchema = z.object({
  searchTerm: z.string().min(1, "Arama terimi gerekli"),
  chatId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
});

// Mesaj arama
router.get(
  "/messages/search",
  authenticateToken,
  requestValidator(searchMessagesSchema),
  async (req, res, next) => {
    try {
      const results = await ChatService.searchMessages(req.user!.userId, {
        searchTerm: req.query.searchTerm as string,
        chatId: req.query.chatId as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });

      res.json({ success: true, ...results });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
