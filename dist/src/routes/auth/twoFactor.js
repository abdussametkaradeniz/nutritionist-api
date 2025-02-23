"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const twoFactorService_1 = require("../../services/twoFactorService");
const router = express_1.default.Router();
// 2FA setup
router.post("/setup", auth_1.authenticateToken, twoFactorService_1.enable2FA);
router.post("/verify", auth_1.authenticateToken, twoFactorService_1.verify2FA);
router.delete("/disable", auth_1.authenticateToken, twoFactorService_1.disable2FA);
// Backup codes
router.post("/backup-codes", auth_1.authenticateToken, twoFactorService_1.generateBackupCodes);
router.post("/verify-backup", auth_1.authenticateToken, twoFactorService_1.verifyBackupCode);
exports.default = router;
