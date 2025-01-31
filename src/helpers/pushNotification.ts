import { BusinessException } from "../domain/exception";

interface PushNotificationOptions {
  userId: number;
  title: string;
  body: string;
  data?: any;
}

export async function sendPushNotification(
  options: PushNotificationOptions
): Promise<void> {
  try {
    // Burada FCM, OneSignal veya başka bir push notification servisi entegrasyonu yapılabilir
    console.log("Push notification sent:", options);

    // Örnek implementasyon:
    // await firebaseAdmin.messaging().send({
    //   token: userDeviceToken,
    //   notification: {
    //     title: options.title,
    //     body: options.body
    //   },
    //   data: options.data
    // });
  } catch (error) {
    console.error("Push notification error:", error);
    throw new BusinessException("Push notification gönderme hatası", 500);
  }
}
