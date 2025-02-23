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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const emailService_1 = require("../services/emailService");
const password_1 = require("../helpers/password");
const emailVerification_1 = __importDefault(require("../routes/auth/emailVerification"));
const jwt_1 = require("src/helpers/jwt");
// Test için minimal bir Express uygulaması oluştur
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth/email-verification", emailVerification_1.default);
// Email servisini mock'la
jest.mock("../services/emailService");
const prisma = new client_1.PrismaClient();
describe("Email Verification Tests", () => {
    let authToken;
    let testUser;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Test başlamadan önce mock'ları ayarla
        emailService_1.EmailService.sendVerificationEmail.mockResolvedValue(undefined);
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Test kullanıcısı oluştur
        const hashedPassword = yield (0, password_1.hashPassword)("test123");
        testUser = yield prisma.user.create({
            data: {
                email: "test@example.com",
                username: "testuser",
                passwordHash: hashedPassword,
                emailVerified: false,
            },
        });
        // Access token oluştur
        authToken = (0, jwt_1.generateAccessToken)(testUser);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Test verilerini temizle
        yield prisma.emailVerification.deleteMany({
            where: { userId: testUser.id },
        });
        yield prisma.user.delete({
            where: { id: testUser.id },
        });
    }));
    test("should send verification email", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/api/auth/email-verification/send")
            .set("Authorization", `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Doğrulama emaili gönderildi");
    }));
    test("should verify email with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
        // Test token oluştur
        const verificationToken = yield prisma.emailVerification.create({
            data: {
                userId: testUser.id,
                token: "test-token",
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                lastUpdatingUser: "SYSTEM",
                recordStatus: "A",
            },
        });
        const response = yield (0, supertest_1.default)(app)
            .post("/api/auth/email-verification/verify")
            .send({ token: "test-token" });
        expect(response.status).toBe(200);
    }));
});
