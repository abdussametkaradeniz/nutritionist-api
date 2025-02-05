import { NotificationRepository } from "../repositories/notificationRepository";
import { sendEmail } from "../helpers/email";
import { sendPushNotification } from "../helpers/pushNotification";

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
    const { sendPush, sendEmail: shouldSendEmail, ...notificationData } = data;
    const notification =
      await NotificationRepository.createNotification(notificationData);

    try {
      if (sendPush) {
        const user = await NotificationRepository.getUserWithPreferences(
          data.userId
        );

        if (user?.preferences?.pushNotifications) {
          await sendPushNotification({
            userId: data.userId,
            title: data.title,
            body: data.message,
            data: data.data,
          });
        }
      }

      if (shouldSendEmail) {
        const user = await NotificationRepository.getUserWithPreferences(
          data.userId
        );

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
    return await NotificationRepository.getUserNotifications(
      userId,
      page,
      limit,
      onlyUnread
    );
  }

  static async markAsRead(id: number, userId: number) {
    return await NotificationRepository.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: number) {
    return await NotificationRepository.markAllAsRead(userId);
  }

  static async getUnreadCount(userId: number) {
    return await NotificationRepository.getUnreadCount(userId);
  }

  static async deleteNotification(id: number, userId: number) {
    return await NotificationRepository.deleteNotification(id, userId);
  }

  // Helper methods
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
