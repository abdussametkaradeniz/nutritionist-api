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
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const exception_1 = require("../domain/exception");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.templateId
                    ? yield renderTemplate(options.templateId, options.templateData)
                    : undefined,
            });
        }
        catch (error) {
            console.error("Email sending error:", error);
            throw new exception_1.BusinessException("Email gönderme hatası", 500);
        }
    });
}
function renderTemplate(templateId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Template rendering logic here
        // Bu kısım template engine'e göre değişebilir (ejs, handlebars vb.)
        return `<h1>${data.title}</h1><p>${data.message}</p>`;
    });
}
