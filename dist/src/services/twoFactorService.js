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
exports.generateBackupCodes = exports.verifyBackupCode = exports.disable2FA = exports.verify2FA = exports.enable2FA = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const client_1 = __importDefault(require("../../prisma/client"));
const auth_1 = require("../utils/auth");
const enable2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Generate secret
        const secret = speakeasy_1.default.generateSecret({
            name: `YourApp:${(_b = req.user) === null || _b === void 0 ? void 0 : _b.email}`,
        });
        // Generate QR code
        const qrCodeUrl = yield qrcode_1.default.toDataURL(secret.otpauth_url);
        // Store secret temporarily (should be confirmed before saving permanently)
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: secret.base32,
                twoFactorEnabled: false,
            },
        });
        res.json({
            secret: secret.base32,
            qrCode: qrCodeUrl,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to setup 2FA" });
    }
});
exports.enable2FA = enable2FA;
const verify2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { token } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.twoFactorSecret)) {
            return res.status(400).json({ error: "2FA not setup" });
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
        });
        if (!verified) {
            return res.status(400).json({ error: "Invalid token" });
        }
        // Generate backup codes if not already generated
        const backupCodes = (0, auth_1.generateRandomCodes)(8);
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                twoFactorEnabled: true,
                backupCodes,
            },
        });
        res.json({
            enabled: true,
            backupCodes,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify 2FA" });
    }
});
exports.verify2FA = verify2FA;
const disable2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: null,
                twoFactorEnabled: false,
                backupCodes: [],
            },
        });
        res.json({ message: "2FA disabled successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to disable 2FA" });
    }
});
exports.disable2FA = disable2FA;
const verifyBackupCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { code } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.backupCodes.includes(code))) {
            return res.status(400).json({ error: "Invalid backup code" });
        }
        // Remove used backup code
        yield client_1.default.user.update({
            where: { id: userId },
            data: {
                backupCodes: user.backupCodes.filter((c) => c !== code),
            },
        });
        res.json({ verified: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify backup code" });
    }
});
exports.verifyBackupCode = verifyBackupCode;
const generateBackupCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const backupCodes = (0, auth_1.generateRandomCodes)(8);
        yield client_1.default.user.update({
            where: { id: userId },
            data: { backupCodes },
        });
        res.json({ backupCodes });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to generate backup codes" });
    }
});
exports.generateBackupCodes = generateBackupCodes;
