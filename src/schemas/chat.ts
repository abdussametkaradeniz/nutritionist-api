import { z } from "zod";
import { MessageType } from "@prisma/client";

export const createChatSchema = z.object({
  participantIds: z.array(z.number()).min(1, "En az bir katılımcı gerekli"),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Mesaj boş olamaz"),
  type: z.nativeEnum(MessageType).optional(),
  mediaUrl: z.string().url().optional(),
});

export const getMessagesSchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20))
    .refine((val) => val > 0 && val <= 50, {
      message: "Limit 1-50 arasında olmalıdır",
    }),
});
