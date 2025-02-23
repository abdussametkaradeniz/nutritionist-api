import { Prisma, MessageType } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
import { Server } from "socket.io";
import { E2EEncryption } from "../utils/encryption";
import { BusinessException } from "../domain/exception";

export class ChatService {
  static async createChat(participantIds: number[]) {
    if (participantIds.length < 2) {
      throw new BusinessException("En az 2 katılımcı gerekli", 400);
    }
    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: participantIds.map((id) => ({
            userId: id,
          })),
        },
      },
    });
    return chat;
  }

  static async sendMessage(
    chatId: string,
    userId: number,
    data: { content: string; attachments?: string[] },
    io?: Server
  ) {
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId: userId,
        content: data.content,
        mediaUrl: data.attachments?.join(", "), // Assuming attachments are URLs stored as comma-separated values
        type: MessageType.TEXT, // Default type, adjust as necessary
      },
    });

    if (io) {
      io.to(chatId).emit("newMessage", message);
    }

    return message;
  }

  static async getMessages(
    chatId: string,
    userId: number,
    query: { before?: Date; limit?: number }
  ) {
    const messages = await prisma.chatMessage.findMany({
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
  }

  static async markMessageAsRead(
    messageId: string,
    userId: number,
    io?: Server
  ) {
    const messageRead = await prisma.messageRead.upsert({
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
  }

  static async getUserChats(userId: number) {
    const chats = await prisma.chat.findMany({
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
  }

  static async searchMessages(
    userId: number,
    params: {
      searchTerm: string;
      chatId?: string;
      startDate?: Date;
      endDate?: Date;
      page: number;
      limit: number;
    }
  ) {
    const messages = await prisma.chatMessage.findMany({
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
  }

  static async sendEncryptedMessage(
    chatId: string,
    senderId: number,
    data: {
      content: string;
      type?: MessageType;
      mediaUrl?: string;
    },
    io: Server
  ) {
    // Chat katılımcılarını bul
    const participants = await prisma.chatParticipant.findMany({
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
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { privateKey: true },
    });

    if (!sender?.privateKey) {
      throw new AppError("Gönderen kullanıcının şifreleme anahtarı yok", 400);
    }

    // Her alıcı için mesajı şifrele
    const encryptedMessages = participants
      .filter((p) => p.user.id !== senderId && p.user.publicKey)
      .map((p) => {
        const encrypted = E2EEncryption.encryptMessage(
          data.content,
          sender.privateKey!,
          p.user.publicKey!
        );
        return {
          recipientId: p.user.id,
          ...encrypted,
        };
      });

    // Mesajı kaydet
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content: data.content,
        type: data.type || MessageType.TEXT,
        mediaUrl: data.mediaUrl,
        isEncrypted: true,
        encryptedContent: encryptedMessages[0]?.encrypted,
        nonce: encryptedMessages[0]?.nonce,
        ephemeralPublicKey: encryptedMessages[0]?.ephemeralPublicKey,
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
      io.to(`user:${em.recipientId}`).emit("message:encrypted", {
        ...message,
        encrypted: em.encrypted,
        nonce: em.nonce,
        ephemeralPublicKey: em.ephemeralPublicKey,
      });
    });

    return message;
  }
}
