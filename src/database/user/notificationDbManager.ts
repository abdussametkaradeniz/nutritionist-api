import { PrismaClient } from "@prisma/client";
import { BusinessException } from "../../domain/exception";

const prisma = new PrismaClient();

export class NotificationDbManager {
  async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    data?: any;
  }) {
    return await prisma.notification.create({
      data: {
        ...data,
        data: data.data ? data.data : undefined,
        lastUpdatingUser: data.userId.toString(),
      },
    });
  }

  async getUserNotifications(
    userId: number,
    page = 1,
    limit = 20,
    onlyUnread = false
  ) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      recordStatus: "A",
      ...(onlyUnread && { isRead: false }),
    };

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId, recordStatus: "A" },
    });

    if (!notification) {
      throw new BusinessException("Bildirim bulunamadı", 404);
    }

    return await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        recordStatus: "A",
      },
      data: {
        isRead: true,
        readAt: new Date(),
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  async getUnreadCount(userId: number) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        recordStatus: "A",
      },
    });
  }

  async deleteNotification(id: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId, recordStatus: "A" },
    });

    if (!notification) {
      throw new BusinessException("Bildirim bulunamadı", 404);
    }

    return await prisma.notification.update({
      where: { id },
      data: {
        recordStatus: "D",
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }
}
