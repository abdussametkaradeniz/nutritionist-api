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
exports.MealPlanService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
const foodService_1 = require("./foodService");
class MealPlanService {
    // Öğün planı oluşturma
    static createMealPlan(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Kullanıcı kontrolü
            const user = yield client_1.default.user.findUnique({
                where: { id: data.userId },
            });
            if (!user) {
                throw new appError_1.AppError("Kullanıcı bulunamadı", 404);
            }
            // Diyetisyen kontrolü
            if (data.dietitianId) {
                const dietitian = yield client_1.default.user.findFirst({
                    where: {
                        id: data.dietitianId,
                        role: {
                            name: "DIETITIAN",
                        },
                    },
                });
                if (!dietitian) {
                    throw new appError_1.AppError("Diyetisyen bulunamadı", 404);
                }
            }
            // Öğün planı oluştur
            return yield client_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Ana planı oluştur
                const mealPlan = yield tx.mealPlan.create({
                    data: {
                        userId: data.userId,
                        dietitianId: data.dietitianId,
                        startDate: data.startDate,
                        endDate: data.endDate,
                    },
                });
                // Öğünleri ve besinleri ekle
                for (const meal of data.meals) {
                    yield tx.meal.create({
                        data: {
                            mealPlanId: mealPlan.id,
                            name: meal.name,
                            time: meal.time,
                            notes: meal.notes,
                            foods: {
                                create: meal.foods,
                            },
                        },
                    });
                }
                return yield tx.mealPlan.findUnique({
                    where: { id: mealPlan.id },
                    include: {
                        meals: {
                            include: {
                                foods: {
                                    include: {
                                        food: true,
                                    },
                                },
                            },
                        },
                    },
                });
            }));
        });
    }
    // Öğün planı güncelleme
    static updateMealPlan(id, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const mealPlan = yield client_1.default.mealPlan.findFirst({
                where: {
                    id,
                    OR: [{ userId }, { dietitianId: userId }],
                },
            });
            if (!mealPlan) {
                throw new appError_1.AppError("Öğün planı bulunamadı", 404);
            }
            return yield client_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Ana plan güncelleme
                yield tx.mealPlan.update({
                    where: { id },
                    data: {
                        endDate: data.endDate,
                        isActive: data.isActive,
                    },
                });
                if (data.meals) {
                    // Mevcut öğünleri sil
                    yield tx.meal.deleteMany({
                        where: { mealPlanId: id },
                    });
                    // Yeni öğünleri ekle
                    for (const meal of data.meals) {
                        yield tx.meal.create({
                            data: {
                                mealPlanId: id,
                                name: meal.name,
                                time: meal.time,
                                notes: meal.notes,
                                foods: {
                                    create: meal.foods,
                                },
                            },
                        });
                    }
                }
                return yield tx.mealPlan.findUnique({
                    where: { id },
                    include: {
                        meals: {
                            include: {
                                foods: {
                                    include: {
                                        food: true,
                                    },
                                },
                            },
                        },
                    },
                });
            }));
        });
    }
    // Öğün planı listeleme
    static getMealPlans(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, isActive, startDate, endDate, page = 1, limit = 10, } = params;
            const where = Object.assign(Object.assign(Object.assign({ OR: [{ userId }, { dietitianId: userId }] }, (isActive !== undefined && { isActive })), (startDate && { startDate: { gte: startDate } })), (endDate && { endDate: { lte: endDate } }));
            const [mealPlans, total] = yield Promise.all([
                client_1.default.mealPlan.findMany({
                    where,
                    include: {
                        meals: {
                            include: {
                                foods: {
                                    include: {
                                        food: true,
                                    },
                                },
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                        dietitian: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: {
                        startDate: "desc",
                    },
                }),
                client_1.default.mealPlan.count({ where }),
            ]);
            return {
                data: mealPlans,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    // Günlük besin değeri hesaplama
    static calculateDailyNutrition(mealPlanId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const meals = yield client_1.default.meal.findMany({
                where: {
                    mealPlanId,
                    time: {
                        gte: new Date(date.setHours(0, 0, 0, 0)),
                        lt: new Date(date.setHours(23, 59, 59, 999)),
                    },
                },
                include: {
                    foods: {
                        include: {
                            food: true,
                        },
                    },
                },
            });
            let totals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                cholesterol: 0,
            };
            for (const meal of meals) {
                for (const mealFood of meal.foods) {
                    const nutrition = yield foodService_1.FoodService.calculateNutrition(mealFood.food.id, mealFood.amount);
                    totals.calories += nutrition.calories;
                    totals.protein += nutrition.protein;
                    totals.carbs += nutrition.carbs;
                    totals.fat += nutrition.fat;
                    totals.fiber += nutrition.fiber;
                    totals.sugar += nutrition.sugar || 0;
                    totals.sodium += nutrition.sodium || 0;
                    totals.cholesterol += nutrition.cholesterol || 0;
                }
            }
            return totals;
        });
    }
}
exports.MealPlanService = MealPlanService;
