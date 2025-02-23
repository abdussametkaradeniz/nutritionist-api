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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const exception_1 = require("../domain/exception");
class EmailService {
    static sendVerificationEmail(to, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
            try {
                yield EmailService.transporter.sendMail({
                    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                    to,
                    subject: "Email Adresinizi Doğrulayın",
                    html: `
          <h1>Email Doğrulama</h1>
          <p>Merhaba,</p>
          <p>Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
          <p>
            <a href="${verificationUrl}" style="
              padding: 12px 24px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            ">
              Email Adresimi Doğrula
            </a>
          </p>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
          <p>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
        `,
                });
            }
            catch (error) {
                console.error("Email gönderimi başarısız:", error);
                throw new exception_1.BusinessException("Email gönderilemedi", 500);
            }
        });
    }
    sendPasswordResetEmail(to, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: to,
                subject: "Şifre Sıfırlama Talebi",
                html: `
        <h1>Şifre Sıfırlama</h1>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetLink}">Şifremi Sıfırla</a>
        <p>Bu bağlantı 1 saat süreyle geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      `,
            };
            try {
                yield EmailService.transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error("Email sending failed:", error);
                throw new Error("Failed to send email");
            }
        });
    }
    // Email servisinin çalışıp çalışmadığını kontrol etmek için
    verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield EmailService.transporter.verify();
                return true;
            }
            catch (error) {
                console.error("Email service verification failed:", error);
                return false;
            }
        });
    }
}
exports.EmailService = EmailService;
EmailService.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
