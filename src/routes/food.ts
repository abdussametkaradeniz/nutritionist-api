import express from "express";
import { FoodService } from "../services/foodService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";
import {
  createCategorySchema,
  createFoodSchema,
} from "src/validations/foodValidation";

const router = express.Router();

// Kategori route'ları
router.post(
  "/categories",
  authenticateToken,
  requestValidator(createCategorySchema),
  async (req, res, next) => {
    try {
      const category = await FoodService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/categories", authenticateToken, async (req, res, next) => {
  try {
    const categories = await FoodService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/categories/:id",
  authenticateToken,
  requestValidator(createCategorySchema.partial()),
  async (req, res, next) => {
    try {
      const category = await FoodService.updateCategory(
        Number(req.params.id),
        req.body
      );
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
);

// Besin route'ları
router.post(
  "/",
  authenticateToken,
  requestValidator(createFoodSchema),
  async (req, res, next) => {
    try {
      const food = await FoodService.createFood(req.body);
      res.status(201).json({ success: true, data: food });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const foods = await FoodService.getFoods({
      search: req.query.search as string,
      categoryId: req.query.categoryId
        ? Number(req.query.categoryId)
        : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...foods });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  authenticateToken,
  requestValidator(createFoodSchema.partial()),
  async (req, res, next) => {
    try {
      const food = await FoodService.updateFood(
        Number(req.params.id),
        req.body
      );
      res.json({ success: true, data: food });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:id/calculate",
  authenticateToken,
  requestValidator(
    z.object({
      amount: z.number().positive(),
    })
  ),
  async (req, res, next) => {
    try {
      const nutrition = await FoodService.calculateNutrition(
        Number(req.params.id),
        req.body.amount
      );
      res.json({ success: true, data: nutrition });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
