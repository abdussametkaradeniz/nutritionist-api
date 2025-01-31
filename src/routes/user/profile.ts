import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { ProfileService } from "../../services/profileService";
import { requestValidator } from "../../middleware/requestValidator";
import {
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} from "../../validations/user/profileValidator";
import multer from "multer";
import { BusinessException } from "../../domain/exception";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Profil bilgilerini getir
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const profile = await ProfileService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Profil bilgilerini güncelle
router.put(
  "/",
  authenticateToken,
  requestValidator(updateProfileSchema),
  async (req, res, next) => {
    try {
      const updatedProfile = await ProfileService.updateProfile(
        req.user!.userId,
        req.body
      );
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  }
);

// Avatar yükle/güncelle
router.post(
  "/avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new BusinessException("Dosya yüklenmedi", 400);
      }

      const updatedProfile = await ProfileService.updateAvatar(
        req.user!.userId,
        req.file
      );
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  }
);

// Avatar sil
router.delete("/avatar", authenticateToken, async (req, res, next) => {
  try {
    const updatedProfile = await ProfileService.deleteAvatar(req.user!.userId);
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// Şifre değiştir
router.put(
  "/change-password",
  authenticateToken,
  requestValidator(changePasswordSchema),
  async (req, res, next) => {
    try {
      await ProfileService.changePassword(req.user!.userId, req.body);
      res.json({ message: "Şifre başarıyla güncellendi" });
    } catch (error) {
      next(error);
    }
  }
);

// Kullanıcı tercihlerini getir
router.get("/preferences", authenticateToken, async (req, res, next) => {
  try {
    const profile = await ProfileService.getProfile(req.user!.userId);
    res.json(profile.preferences);
  } catch (error) {
    next(error);
  }
});

// Kullanıcı tercihlerini güncelle
router.put(
  "/preferences",
  authenticateToken,
  requestValidator(updatePreferencesSchema),
  async (req, res, next) => {
    try {
      const updatedPreferences = await ProfileService.updatePreferences(
        req.user!.userId,
        req.body
      );
      res.json(updatedPreferences);
    } catch (error) {
      next(error);
    }
  }
);

// Hesabı sil
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    await ProfileService.deleteAccount(req.user!.userId);
    res.json({ message: "Hesap başarıyla silindi" });
  } catch (error) {
    next(error);
  }
});

export default router;
