import nodemailer from "nodemailer";
import { BusinessException } from "../domain/exception";

export class EmailService {
  private static readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    try {
      await EmailService.transporter.sendMail({
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
    } catch (error) {
      console.error("Email gönderimi başarısız:", error);
      throw new BusinessException("Email gönderilemedi", 500);
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM,
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
      await EmailService.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  // Email servisinin çalışıp çalışmadığını kontrol etmek için
  async verifyConnection(): Promise<boolean> {
    try {
      await EmailService.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service verification failed:", error);
      return false;
    }
  }
}
