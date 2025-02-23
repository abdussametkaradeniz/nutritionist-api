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
const express_1 = __importDefault(require("express"));
const foodService_1 = require("../services/foodService");
const auth_1 = require("../middleware/auth");
const requestValidator_1 = require("../middleware/requestValidator");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Validasyon şemaları
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Kategori adı gerekli"),
    description: zod_1.z.string().optional(),
});
const createFoodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Besin adı gerekli"),
    categoryId: zod_1.z.number().int().positive(),
    calories: zod_1.z.number().min(0),
    protein: zod_1.z.number().min(0),
    carbs: zod_1.z.number().min(0),
    fat: zod_1.z.number().min(0),
    fiber: zod_1.z.number().min(0),
    sugar: zod_1.z.number().min(0).optional(),
    sodium: zod_1.z.number().min(0).optional(),
    cholesterol: zod_1.z.number().min(0).optional(),
    servingSize: zod_1.z.number().positive(),
    servingUnit: zod_1.z.string().min(1),
});
// Kategori route'ları
router.post("/categories", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createCategorySchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield foodService_1.FoodService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/categories", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield foodService_1.FoodService.getCategories();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/categories/:id", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createCategorySchema.partial()), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield foodService_1.FoodService.updateCategory(Number(req.params.id), req.body);
        res.json({ success: true, data: category });
    }
    catch (error) {
        next(error);
    }
}));
// Besin route'ları
router.post("/", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createFoodSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const food = yield foodService_1.FoodService.createFood(req.body);
        res.status(201).json({ success: true, data: food });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foods = yield foodService_1.FoodService.getFoods({
            search: req.query.search,
            categoryId: req.query.categoryId
                ? Number(req.query.categoryId)
                : undefined,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
        });
        res.json(Object.assign({ success: true }, foods));
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/:id", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(createFoodSchema.partial()), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const food = yield foodService_1.FoodService.updateFood(Number(req.params.id), req.body);
        res.json({ success: true, data: food });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/:id/calculate", auth_1.authenticateToken, (0, requestValidator_1.requestValidator)(zod_1.z.object({
    amount: zod_1.z.number().positive(),
})), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const nutrition = yield foodService_1.FoodService.calculateNutrition(Number(req.params.id), req.body.amount);
        res.json({ success: true, data: nutrition });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
