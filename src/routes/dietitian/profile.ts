import express from "express";
import { DietitianService } from "../../services/dietitianService";
import { authenticateToken } from "../../middleware/auth";
import { requestValidator } from "../../middleware/requestValidator";
import {
  dietitianProfileSchema,
  workingHoursSchema,
  pricingSchema,
} from "../../schemas/dietitian";
import { validateDietitian } from "../../middleware/validateDietitian";

const router = express.Router();

// Profil işlemleri
router.post(
  "/",
  authenticateToken,
  requestValidator(dietitianProfileSchema),
  async (req, res) => {
    const profile = await DietitianService.createProfile(
      req.user!.userId,
      req.body
    );
    res.json({ success: true, data: profile });
  }
);

router.get("/", authenticateToken, validateDietitian, async (req, res) => {
  const profile = await DietitianService.getProfile(req.user!.userId);
  res.json({ success: true, data: profile });
});

router.put(
  "/",
  authenticateToken,
  validateDietitian,
  requestValidator(dietitianProfileSchema.partial()),
  async (req, res) => {
    const profile = await DietitianService.updateProfile(
      req.user!.userId,
      req.body
    );
    res.json({ success: true, data: profile });
  }
);

// Uzmanlık alanları
router.post(
  "/specialties/:specialtyId",
  authenticateToken,
  validateDietitian,
  async (req, res) => {
    const specialtyId = parseInt(req.params.specialtyId);
    const specialty = await DietitianService.addSpecialty(
      req.user!.userId,
      specialtyId
    );
    res.json({ success: true, data: specialty });
  }
);

router.delete(
  "/specialties/:specialtyId",
  authenticateToken,
  validateDietitian,
  async (req, res) => {
    const specialtyId = parseInt(req.params.specialtyId);
    await DietitianService.removeSpecialty(req.user!.userId, specialtyId);
    res.json({ success: true });
  }
);

// Çalışma saatleri
router.post(
  "/schedule",
  authenticateToken,
  validateDietitian,
  requestValidator(workingHoursSchema),
  async (req, res) => {
    const schedule = await DietitianService.addWorkingHours(
      req.user!.userId,
      req.body
    );
    res.json({ success: true, data: schedule });
  }
);

router.put(
  "/schedule/:id",
  authenticateToken,
  validateDietitian,
  requestValidator(workingHoursSchema.partial()),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const schedule = await DietitianService.updateWorkingHours(
      req.user!.userId,
      id,
      req.body
    );
    res.json({ success: true, data: schedule });
  }
);

router.delete(
  "/schedule/:id",
  authenticateToken,
  validateDietitian,
  async (req, res) => {
    const id = parseInt(req.params.id);
    await DietitianService.deleteWorkingHours(req.user!.userId, id);
    res.json({ success: true });
  }
);

// Fiyatlandırma
router.post(
  "/pricing",
  authenticateToken,
  validateDietitian,
  requestValidator(pricingSchema),
  async (req, res) => {
    const pricing = await DietitianService.addPricingPackage(
      req.user!.userId,
      req.body
    );
    res.json({ success: true, data: pricing });
  }
);

router.put(
  "/pricing/:id",
  authenticateToken,
  validateDietitian,
  requestValidator(pricingSchema.partial()),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const pricing = await DietitianService.updatePricingPackage(
      req.user!.userId,
      id,
      req.body
    );
    res.json({ success: true, data: pricing });
  }
);

router.delete(
  "/pricing/:id",
  authenticateToken,
  validateDietitian,
  async (req, res) => {
    const id = parseInt(req.params.id);
    await DietitianService.deletePricingPackage(req.user!.userId, id);
    res.json({ success: true });
  }
);

export default router;
