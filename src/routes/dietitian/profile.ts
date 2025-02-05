import express from "express";
import { DietitianService } from "../../services/dietitianService";
import { authenticateToken } from "../../middleware/auth";
import { validateDietitian } from "../../middleware/validateDietitian";
import { validateProfileCompletion } from "../../middleware/validateProfileCompletion";
import { requestValidator } from "../../middleware/requestValidator";
import {
  dietitianProfileSchema,
  workingHoursSchema,
  pricingSchema,
} from "../../schemas/dietitian";
import {
  dietitianProfileLimiter,
  workingHoursLimiter,
  pricingLimiter,
} from "../../middleware/rateLimiter";
import { z } from "zod";
import { AppError } from "../../utils/appError";
import { Specialization } from "@prisma/client";

const router = express.Router();

// Helper function to validate Specialization enum values
const isValidSpecialization = (value: string): value is Specialization => {
  return Object.values(Specialization).includes(value as Specialization);
};

// Profil işlemleri
router.post(
  "/",
  authenticateToken,
  validateDietitian,
  dietitianProfileLimiter,
  requestValidator(dietitianProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await DietitianService.createProfile(
        req.user!.userId,
        req.body
      );
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/",
  authenticateToken,
  validateDietitian,
  async (req, res, next) => {
    try {
      const profile = await DietitianService.getProfile(req.user!.userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/",
  authenticateToken,
  validateDietitian,
  requestValidator(dietitianProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await DietitianService.updateProfile(
        req.user!.userId,
        req.body
      );
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
);

// Uzmanlık alanları
router.post(
  "/specialties/:specialtyId",
  authenticateToken,
  validateDietitian,
  async (req, res, next) => {
    try {
      const specialtyId = req.params.specialtyId;

      if (!isValidSpecialization(specialtyId)) {
        throw new AppError(`Invalid specialization value: ${specialtyId}`, 400);
      }

      const specialty = await DietitianService.addSpecialty(
        req.user!.userId,
        specialtyId as Specialization
      );
      res.json({ success: true, data: specialty });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/specialties/:specialtyId",
  authenticateToken,
  validateDietitian,
  async (req, res, next) => {
    try {
      const specialtyId = req.params.specialtyId;

      if (!isValidSpecialization(specialtyId)) {
        throw new AppError(`Invalid specialization value: ${specialtyId}`, 400);
      }

      await DietitianService.removeSpecialty(
        req.user!.userId,
        specialtyId as Specialization
      );
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
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
    const schedule = await DietitianService.updateWorkingHours(
      req.user!.userId,
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

// Çalışma Saatleri
router.put(
  "/working-hours",
  authenticateToken,
  validateDietitian,
  validateProfileCompletion,
  workingHoursLimiter,
  requestValidator(z.array(workingHoursSchema)),
  async (req, res, next) => {
    try {
      const hours = await DietitianService.updateWorkingHours(
        req.user!.userId,
        req.body
      );
      res.json({ success: true, data: hours });
    } catch (error) {
      next(error);
    }
  }
);

// Fiyatlandırma Paketleri
router.post(
  "/packages",
  authenticateToken,
  validateDietitian,
  validateProfileCompletion,
  pricingLimiter,
  requestValidator(pricingSchema),
  async (req, res, next) => {
    try {
      const packageData = await DietitianService.createPricingPackage(
        req.user!.userId,
        req.body
      );
      res.status(201).json({ success: true, data: packageData });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/packages/:id",
  authenticateToken,
  validateDietitian,
  requestValidator(pricingSchema),
  async (req, res, next) => {
    try {
      const packageData = await DietitianService.updatePricingPackage(
        req.user!.userId,
        req.params.id,
        req.body
      );
      res.json({ success: true, data: packageData });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/packages/:id",
  authenticateToken,
  validateDietitian,
  async (req, res, next) => {
    try {
      await DietitianService.deletePricingPackage(
        req.user!.userId,
        req.params.id
      );
      res.json({ success: true, message: "Package deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/packages",
  authenticateToken,
  validateDietitian,
  async (req, res, next) => {
    try {
      const packages = await DietitianService.getPricingPackages(
        req.user!.userId
      );
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
