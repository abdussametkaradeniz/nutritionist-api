import express from "express";
import { FoodService } from "../services/foodService";
import { authenticateToken } from "../middleware/auth";
import { requestValidator } from "../middleware/requestValidator";
import { z } from "zod";

const router = express.Router();

// Validasyon şemaları
const createCategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gerekli"),
  description: z.string().optional(),
});

const createFoodSchema = z.object({
  name: z.string().min(1, "Besin adı gerekli"),
  categoryId: z.number().int().positive(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  cholesterol: z.number().min(0).optional(),
  servingSize: z.number().positive(),
  servingUnit: z.string().min(1),
});

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
