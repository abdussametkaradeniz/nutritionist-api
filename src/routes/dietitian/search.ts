import express from "express";
import { DietitianService } from "../../services/dietitianService";
import { requestValidator } from "../../middleware/requestValidator";
import { z } from "zod";
import { Specialization } from "@prisma/client";

const router = express.Router();

// Arama parametreleri validasyon şeması
const searchParamsSchema = z
  .object({
    specialization: z.nativeEnum(Specialization).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    availableDay: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),
    availableTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(50).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.maxPrice >= data.minPrice;
      }
      return true;
    },
    {
      message: "Maksimum fiyat, minimum fiyattan küçük olamaz",
    }
  );

// Diyetisyen arama
router.get(
  "/search",
  requestValidator(searchParamsSchema),
  async (req, res, next) => {
    try {
      const result = await DietitianService.searchDietitians(req.query);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Uzmanlık alanına göre diyetisyen listesi
router.get("/by-specialization/:specialization", async (req, res, next) => {
  try {
    const specialization = req.params.specialization as Specialization;
    const dietitians =
      await DietitianService.getDietitiansBySpecialization(specialization);
    res.json({
      success: true,
      data: dietitians,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
