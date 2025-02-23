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
exports.ReportService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class ReportService {
    // Haftalık/aylık özet raporu
    static generateSummaryReport(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, startDate, endDate } = params;
            // İlerleme verileri
            const progress = yield client_1.default.progress.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                orderBy: {
                    date: "asc",
                },
            });
            // Öğün planı verileri
            const mealPlans = yield client_1.default.mealPlan.findMany({
                where: {
                    userId,
                    startDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
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
            // Hedef verileri
            const goals = yield client_1.default.goal.findMany({
                where: {
                    userId,
                    startDate: {
                        lte: endDate,
                    },
                    OR: [{ targetDate: { gte: startDate } }, { status: "ACTIVE" }],
                },
            });
            // Özet istatistikler
            const summary = {
                progress: {
                    weightChange: progress.length >= 2
                        ? progress[progress.length - 1].weight - progress[0].weight
                        : null,
                    measurements: {
                        chest: this.calculateChange(progress, "chest"),
                        waist: this.calculateChange(progress, "waist"),
                        hip: this.calculateChange(progress, "hip"),
                        arm: this.calculateChange(progress, "arm"),
                        thigh: this.calculateChange(progress, "thigh"),
                    },
                },
                nutrition: yield this.calculateAverageNutrition(mealPlans),
                goals: goals.map((goal) => (Object.assign(Object.assign({}, goal), { progress: this.calculateGoalProgress(goal, progress) }))),
            };
            return summary;
        });
    }
    // Besin tüketim analizi
    static generateNutritionReport(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, startDate, endDate } = params;
            const mealPlans = yield client_1.default.mealPlan.findMany({
                where: {
                    userId,
                    startDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
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
            // Günlük ortalama besin değerleri
            const dailyAverages = yield this.calculateAverageNutrition(mealPlans);
            // En çok tüketilen besinler
            const topFoods = yield this.calculateTopFoods(mealPlans);
            // Makro besin dağılımı
            const macroDistribution = this.calculateMacroDistribution(dailyAverages);
            return {
                dailyAverages,
                topFoods,
                macroDistribution,
            };
        });
    }
    // Yardımcı fonksiyonlar
    static calculateChange(data, field) {
        if (data.length < 2)
            return null;
        const first = data[0][field];
        const last = data[data.length - 1][field];
        return first && last ? last - first : null;
    }
    static calculateAverageNutrition(mealPlans) {
        return __awaiter(this, void 0, void 0, function* () {
            let totalDays = 0;
            let totals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
            };
            mealPlans.forEach((plan) => {
                plan.meals.forEach((meal) => {
                    meal.foods.forEach((mealFood) => {
                        const { food, amount } = mealFood;
                        const multiplier = amount / food.servingSize;
                        totals.calories += food.calories * multiplier;
                        totals.protein += food.protein * multiplier;
                        totals.carbs += food.carbs * multiplier;
                        totals.fat += food.fat * multiplier;
                        totals.fiber += food.fiber * multiplier;
                    });
                });
                totalDays++;
            });
            return totalDays > 0
                ? {
                    calories: Math.round(totals.calories / totalDays),
                    protein: Math.round(totals.protein / totalDays),
                    carbs: Math.round(totals.carbs / totalDays),
                    fat: Math.round(totals.fat / totalDays),
                    fiber: Math.round(totals.fiber / totalDays),
                }
                : null;
        });
    }
    static calculateMacroDistribution(nutrition) {
        if (!nutrition)
            return null;
        const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
        return {
            protein: Math.round((nutrition.protein / totalMacros) * 100),
            carbs: Math.round((nutrition.carbs / totalMacros) * 100),
            fat: Math.round((nutrition.fat / totalMacros) * 100),
        };
    }
    static calculateTopFoods(mealPlans) {
        return __awaiter(this, void 0, void 0, function* () {
            const foodCounts = {};
            mealPlans.forEach((plan) => {
                plan.meals.forEach((meal) => {
                    meal.foods.forEach((mealFood) => {
                        const foodId = mealFood.food.id;
                        foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;
                    });
                });
            });
            const topFoodIds = Object.entries(foodCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([id]) => parseInt(id));
            return yield client_1.default.food.findMany({
                where: {
                    id: {
                        in: topFoodIds,
                    },
                },
            });
        });
    }
    static calculateGoalProgress(goal, progress) {
        if (!goal.targetWeight || progress.length === 0)
            return null;
        const latestProgress = progress[progress.length - 1];
        const totalWeightGoal = goal.targetWeight - goal.startWeight;
        const currentProgress = latestProgress.weight - goal.startWeight;
        return {
            currentWeight: latestProgress.weight,
            progressPercentage: Math.min(Math.max((currentProgress / totalWeightGoal) * 100, 0), 100),
            remainingDays: Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)),
        };
    }
}
exports.ReportService = ReportService;
