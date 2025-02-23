import express from "express";
import { authenticateToken } from "../../middleware/auth";
import {
  enable2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes,
  verifyBackupCode,
} from "../../services/twoFactorService";

const router = express.Router();

// 2FA setup
router.post("/setup", authenticateToken, enable2FA);
router.post("/verify", authenticateToken, verify2FA);
router.delete("/disable", authenticateToken, disable2FA);

// Backup codes
router.post("/backup-codes", authenticateToken, generateBackupCodes);
router.post("/verify-backup", authenticateToken, verifyBackupCode);

export default router;
