import nodemailer from "nodemailer";
import { BusinessException } from "../domain/exception";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  templateId?: string;
  templateData?: any;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.templateId
        ? await renderTemplate(options.templateId, options.templateData)
        : undefined,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new BusinessException("Email gönderme hatası", 500);
  }
}

async function renderTemplate(templateId: string, data: any): Promise<string> {
  // Template rendering logic here
  // Bu kısım template engine'e göre değişebilir (ejs, handlebars vb.)
  return `<h1>${data.title}</h1><p>${data.message}</p>`;
}
