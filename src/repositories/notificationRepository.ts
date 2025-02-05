import { PrismaClient, Notification } from "@prisma/client";

export class NotificationRepository {
  private static prisma = new PrismaClient();

  static async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    data?: any;
  }) {
    return await this.prisma.notification.create({
      data,
    });
  }

  static async getUserNotifications(
    userId: number,
    page = 1,
    limit = 10,
    onlyUnread = false
  ) {
    return await this.prisma.notification.findMany({
      where: {
        userId,
        ...(onlyUnread ? { read: false } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  static async markAsRead(id: number, userId: number) {
    return await this.prisma.notification.update({
      where: { id, userId },
      data: {
        isRead: true,
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  static async markAllAsRead(userId: number) {
    return await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  static async getUnreadCount(userId: number) {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  static async deleteNotification(id: number, userId: number) {
    return await this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  static async getUserWithPreferences(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });
  }
}
