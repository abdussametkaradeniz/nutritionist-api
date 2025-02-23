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
exports.FoodService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
class FoodService {
    // Besin kategorisi işlemleri
    static createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.foodCategory.create({ data });
        });
    }
    static updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.foodCategory.update({
                where: { id },
                data,
            });
        });
    }
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.foodCategory.findMany({
                include: {
                    _count: {
                        select: { foods: true },
                    },
                },
            });
        });
    }
    // Besin işlemleri
    static createFood(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield client_1.default.foodCategory.findUnique({
                where: { id: data.categoryId },
            });
            if (!category) {
                throw new appError_1.AppError("Kategori bulunamadı", 404);
            }
            return yield client_1.default.food.create({ data });
        });
    }
    static updateFood(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.food.update({
                where: { id },
                data,
            });
        });
    }
    static getFoods(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, categoryId, page = 1, limit = 20 } = params;
            const where = Object.assign(Object.assign({}, (search && {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            })), (categoryId && { categoryId }));
            const [foods, total] = yield Promise.all([
                client_1.default.food.findMany({
                    where,
                    include: {
                        category: true,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        name: "asc",
                    },
                }),
                client_1.default.food.count({ where }),
            ]);
            return {
                data: foods,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    static calculateNutrition(foodId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const food = yield client_1.default.food.findUnique({
                where: { id: foodId },
            });
            if (!food) {
                throw new appError_1.AppError("Besin bulunamadı", 404);
            }
            const multiplier = amount / food.servingSize;
            return {
                calories: food.calories * multiplier,
                protein: food.protein * multiplier,
                carbs: food.carbs * multiplier,
                fat: food.fat * multiplier,
                fiber: food.fiber * multiplier,
                sugar: food.sugar ? food.sugar * multiplier : null,
                sodium: food.sodium ? food.sodium * multiplier : null,
                cholesterol: food.cholesterol ? food.cholesterol * multiplier : null,
            };
        });
    }
}
exports.FoodService = FoodService;
