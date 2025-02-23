import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { EmailService } from "../services/emailService";
import { hashPassword } from "../helpers/password";
import emailVerification from "../routes/auth/emailVerification";
import { generateAccessToken } from "../helpers/jwt";
// Test için minimal bir Express uygulaması oluştur
const app = express();
app.use(express.json());
app.use("/api/auth/email-verification", emailVerification);

// Email servisini mock'la
jest.mock("../services/emailService");

const prisma = new PrismaClient();

describe("Email Verification Tests", () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Test başlamadan önce mock'ları ayarla
    (EmailService.sendVerificationEmail as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  beforeEach(async () => {
    // Test kullanıcısı oluştur
    const hashedPassword = await hashPassword("test123");
    testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        username: "testuser",
        passwordHash: hashedPassword,
        emailVerified: false,
      },
    });

    // Access token oluştur
    authToken = generateAccessToken(testUser);
  });

  afterEach(async () => {
    // Test verilerini temizle
    await prisma.emailVerification.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });

  test("should send verification email", async () => {
    const response = await request(app)
      .post("/api/auth/email-verification/send")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Doğrulama emaili gönderildi");
  });

  test("should verify email with valid token", async () => {
    // Test token oluştur
    const verificationToken = await prisma.emailVerification.create({
      data: {
        userId: testUser.id,
        token: "test-token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastUpdatingUser: "SYSTEM",
        recordStatus: "A",
      },
    });

    const response = await request(app)
      .post("/api/auth/email-verification/verify")
      .send({ token: "test-token" });

    expect(response.status).toBe(200);
  });
});
