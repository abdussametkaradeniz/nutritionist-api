import { sendEmail } from "../helpers/email";
import { sendPushNotification } from "../helpers/pushNotification";
import prisma from "../../prisma/client";
export class NotificationService {
  static async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    data?: any;
    sendPush?: boolean;
    sendEmail?: boolean;
  }) {
    const {
      userId,
      sendPush,
      sendEmail: shouldSendEmail,
      ...notificationData
    } = data;

    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        user: { connect: { id: userId } },
      },
    });

    try {
      if (sendPush) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { preferences: true },
        });

        if (user?.preferences?.pushNotifications) {
          await sendPushNotification({
            userId: userId,
            title: data.title,
            body: data.message,
            data: data.data,
          });
        }
      }

      if (shouldSendEmail) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { preferences: true },
        });

        if (user?.preferences?.emailNotifications) {
          await sendEmail({
            to: user.email,
            subject: data.title,
            text: data.message,
            templateId: "notification",
            templateData: {
              title: data.title,
              message: data.message,
              ...data.data,
            },
          });
        }
      }
    } catch (error) {
      console.error("Notification delivery error:", error);
    }

    return notification;
  }

  static async getUserNotifications(
    userId: number,
    page?: number,
    limit?: number,
    onlyUnread = false
  ) {
    return await prisma.notification.findMany({
      where: { userId, isRead: onlyUnread ? false : undefined },
      skip: ((page ?? 1) - 1) * (limit ?? 10),
      take: limit ?? 10,
    });
  }

  static async markAsRead(id: number, userId: number) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async getUnreadCount(userId: number) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  static async deleteNotification(id: number, userId: number) {
    return await prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}
