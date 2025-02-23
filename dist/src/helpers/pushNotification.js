"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
const exception_1 = require("../domain/exception");
function sendPushNotification(options) {
    return __awaiter(this, void 0, void 0, function* () {
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
        }
        catch (error) {
            console.error("Push notification error:", error);
            throw new exception_1.BusinessException("Push notification gönderme hatası", 500);
        }
    });
}
