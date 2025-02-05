import { PrismaClient } from "@prisma/client";

export class ChatRepository {
  private static prisma = new PrismaClient();

  static async createChat(participantIds: number[]) {
    return await this.prisma.chat.create({
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
  }

  static async sendMessage(
    chatId: string,
    userId: number,
    content: string,
    attachments?: string[]
  ) {
    return await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: userId,
        content,
        mediaUrl: attachments?.[0],
        type: attachments ? "FILE" : "TEXT",
      },
      include: {
        sender: true,
      },
    });
  }

  static async getMessages(
    chatId: string,
    userId: number,
    query: { before?: Date; limit?: number }
  ) {
    const { before, limit = 50 } = query;

    return await this.prisma.chatMessage.findMany({
      where: {
        chatId,
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: true,
      },
    });
  }

  static async markMessageAsRead(messageId: string, userId: number) {
    return await this.prisma.messageRead.create({
      data: {
        messageId,
        userId,
      },
    });
  }

  static async getUserChats(userId: number) {
    return await this.prisma.chat.findMany({
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
    const { searchTerm, chatId, startDate, endDate, page, limit } = params;

    return await this.prisma.chatMessage.findMany({
      where: {
        content: { contains: searchTerm },
        chatId: chatId,
        senderId: userId,
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: true,
      },
    });
  }
}
