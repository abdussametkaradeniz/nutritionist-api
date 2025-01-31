import { PrismaClient } from "@prisma/client";
import { NotificationDbManager } from "../database/user/notificationDbManager";
import { sendEmail } from "../helpers/email";
import { sendPushNotification } from "../helpers/pushNotification";

const prisma = new PrismaClient();

export class NotificationService {
  private static notificationDb = new NotificationDbManager();

  static async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    data?: any;
    sendPush?: boolean;
    sendEmail?: boolean;
  }) {
    const { sendPush, sendEmail: shouldSendEmail, ...notificationData } = data;

    // Bildirimi veritabanına kaydet
    const notification =
      await this.notificationDb.createNotification(notificationData);

    try {
      // Kullanıcı tercihlerine göre push notification gönder
      if (sendPush) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          include: { preferences: true },
        });

        if (user?.preferences?.pushNotifications) {
          await sendPushNotification({
            userId: data.userId,
            title: data.title,
            body: data.message,
            data: data.data,
          });
        }
      }

      // Kullanıcı tercihlerine göre email gönder
      if (shouldSendEmail) {
        const user = await prisma.user.findUnique({
          where: { id: data.userId },
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
      // Bildirim gönderme hatası olsa bile işleme devam et
    }

    return notification;
  }

  static async getUserNotifications(
    userId: number,
    page?: number,
    limit?: number,
    onlyUnread = false
  ) {
    return await this.notificationDb.getUserNotifications(
      userId,
      page,
      limit,
      onlyUnread
    );
  }

  static async markAsRead(id: number, userId: number) {
    return await this.notificationDb.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: number) {
    return await this.notificationDb.markAllAsRead(userId);
  }

  static async getUnreadCount(userId: number) {
    return await this.notificationDb.getUnreadCount(userId);
  }

  static async deleteNotification(id: number, userId: number) {
    return await this.notificationDb.deleteNotification(id, userId);
  }

  // Yardımcı metodlar
  static async sendAppointmentNotification(
    userId: number,
    appointmentData: any
  ) {
    return await this.createNotification({
      userId,
      title: "Yeni Randevu",
      message: `${appointmentData.date} tarihinde randevunuz var.`,
      type: "APPOINTMENT",
      data: appointmentData,
      sendPush: true,
      sendEmail: true,
    });
  }

  static async sendMessageNotification(userId: number, messageData: any) {
    return await this.createNotification({
      userId,
      title: "Yeni Mesaj",
      message: `${messageData.senderName}: ${messageData.preview}`,
      type: "MESSAGE",
      data: messageData,
      sendPush: true,
    });
  }

  static async sendSystemNotification(
    userId: number,
    title: string,
    message: string,
    data?: any
  ) {
    return await this.createNotification({
      userId,
      title,
      message,
      type: "SYSTEM",
      data,
      sendPush: true,
      sendEmail: true,
    });
  }
}
