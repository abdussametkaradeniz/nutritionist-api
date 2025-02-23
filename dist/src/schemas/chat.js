"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesSchema = exports.sendMessageSchema = exports.createChatSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createChatSchema = zod_1.z.object({
    participantIds: zod_1.z.array(zod_1.z.number()).min(1, "En az bir katılımcı gerekli"),
});
exports.sendMessageSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Mesaj boş olamaz"),
    type: zod_1.z.nativeEnum(client_1.MessageType).optional(),
    mediaUrl: zod_1.z.string().url().optional(),
});
exports.getMessagesSchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 20))
        .refine((val) => val > 0 && val <= 50, {
        message: "Limit 1-50 arasında olmalıdır",
    }),
});
