import express from "express";
import { DietitianService } from "../../services/dietitianService";
import { requestValidator } from "../../middleware/requestValidator";
import { z } from "zod";
import { Specialization } from "@prisma/client";
import { searchParamsSchema } from "../../validations/searchValidation";

const router = express.Router();

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
