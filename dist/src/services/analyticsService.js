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
exports.AnalyticsService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
class AnalyticsService {
    // Trend Analizi
    static analyzeTrends(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, startDate, endDate } = params;
            // Kilo değişim trendi
            const weightTrend = yield client_1.default.progress.findMany({
                where: {
                    userId,
                    date: { gte: startDate, lte: endDate },
                    weight: { not: null },
                },
                select: {
                    date: true,
                    weight: true,
                },
                orderBy: { date: "asc" },
            });
            // Kalori alım trendi
            const calorieTrend = yield client_1.default.mealPlan.findMany({
                where: {
                    userId,
                    startDate: { gte: startDate, lte: endDate },
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
            // Makro besin trendi
            const macroTrend = this.calculateMacroTrend(calorieTrend);
            return {
                weightTrend: this.calculateRegressionLine(weightTrend),
                calorieTrend: this.calculateDailyCalories(calorieTrend),
                macroTrend,
            };
        });
    }
    // Tahminleme
    static generatePredictions(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, goalId } = params;
            // Hedef bilgilerini al
            const goal = yield client_1.default.goal.findFirst({
                where: { id: goalId, userId },
            });
            if (!goal) {
                throw new appError_1.AppError("Hedef bulunamadı", 404);
            }
            // Son 30 günlük verileri al
            const recentProgress = yield client_1.default.progress.findMany({
                where: {
                    userId,
                    date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
                orderBy: { date: "asc" },
            });
            // Tahminleri hesapla
            const predictions = this.calculatePredictions({
                goal,
                recentProgress,
            });
            return predictions;
        });
    }
    // Öneriler
    static generateRecommendations(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, period = 30 } = params;
            // Beslenme verilerini al
            const nutritionData = yield client_1.default.mealPlan.findMany({
                where: {
                    userId,
                    startDate: { gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) },
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
            // İlerleme verilerini al
            const progressData = yield client_1.default.progress.findMany({
                where: {
                    userId,
                    date: { gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000) },
                },
                orderBy: { date: "asc" },
            });
            // Önerileri oluştur
            return this.generatePersonalizedRecommendations({
                nutritionData,
                progressData,
            });
        });
    }
    // Yardımcı fonksiyonlar
    static calculateRegressionLine(data) {
        if (data.length < 2)
            return null;
        const n = data.length;
        const sumX = data.reduce((sum, _, i) => sum + i, 0);
        const sumY = data.reduce((sum, point) => sum + point.weight, 0);
        const sumXY = data.reduce((sum, point, i) => sum + i * point.weight, 0);
        const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return {
            slope,
            intercept,
            trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable",
            weeklyChange: slope * 7,
        };
    }
    static calculateDailyCalories(mealPlans) {
        return mealPlans.map((plan) => {
            const totalCalories = plan.meals.reduce((sum, meal) => {
                return (sum +
                    meal.foods.reduce((mealSum, food) => {
                        return (mealSum +
                            (food.food.calories * food.amount) / food.food.servingSize);
                    }, 0));
            }, 0);
            return {
                date: plan.startDate,
                calories: Math.round(totalCalories),
            };
        });
    }
    static calculateMacroTrend(mealPlans) {
        return mealPlans.map((plan) => {
            let totals = { protein: 0, carbs: 0, fat: 0 };
            plan.meals.forEach((meal) => {
                meal.foods.forEach((food) => {
                    const multiplier = food.amount / food.food.servingSize;
                    totals.protein += food.food.protein * multiplier;
                    totals.carbs += food.food.carbs * multiplier;
                    totals.fat += food.food.fat * multiplier;
                });
            });
            const total = totals.protein + totals.carbs + totals.fat;
            return {
                date: plan.startDate,
                macros: {
                    protein: Math.round((totals.protein / total) * 100),
                    carbs: Math.round((totals.carbs / total) * 100),
                    fat: Math.round((totals.fat / total) * 100),
                },
            };
        });
    }
    static calculatePredictions(params) {
        const { goal, recentProgress } = params;
        if (recentProgress.length < 2) {
            return null;
        }
        // Mevcut kilo değişim hızını hesapla
        const regression = this.calculateRegressionLine(recentProgress);
        if (!regression)
            return null;
        const currentWeight = recentProgress[recentProgress.length - 1].weight;
        const targetWeight = goal.targetWeight;
        const weeklyChange = regression.weeklyChange;
        // Hedefe ulaşma süresini tahmin et
        const remainingChange = targetWeight - currentWeight;
        const estimatedWeeks = Math.abs(remainingChange / weeklyChange);
        return {
            currentTrend: regression.trend,
            weeklyChange: weeklyChange,
            estimatedWeeks: Math.round(estimatedWeeks),
            estimatedDate: new Date(Date.now() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000),
            recommendations: this.generateWeightRecommendations(weeklyChange, remainingChange),
        };
    }
    static generatePersonalizedRecommendations(params) {
        const { nutritionData, progressData } = params;
        const recommendations = {
            nutrition: [],
            activity: [],
            timing: [],
        };
        // Beslenme önerileri
        const avgCalories = this.calculateAverageCalories(nutritionData);
        const macroDistribution = this.calculateAverageMacros(nutritionData);
        if (avgCalories < 1200) {
            recommendations.nutrition.push("Günlük kalori alımınız çok düşük görünüyor. Sağlıklı bir diyet için kalori alımınızı artırmanızı öneririz.");
        }
        if (macroDistribution.protein < 20) {
            recommendations.nutrition.push("Protein alımınızı artırmanızı öneririz. Bu, kas kütlenizi korumaya ve tok hissetmenize yardımcı olacaktır.");
        }
        // Aktivite önerileri
        if (progressData.length >= 2) {
            const weightTrend = this.calculateRegressionLine(progressData);
            if (weightTrend && weightTrend.trend === "increasing") {
                recommendations.activity.push("Son dönemde kilo alımı gözlemleniyor. Günlük aktivite seviyenizi artırmanızı öneririz.");
            }
        }
        // Öğün zamanlaması önerileri
        const mealTiming = this.analyzeMealTiming(nutritionData);
        if (mealTiming.lateNightEating) {
            recommendations.timing.push("Geç saatlerde yemek yeme alışkanlığınız var. Öğünlerinizi daha erken saatlere kaydırmanızı öneririz.");
        }
        return recommendations;
    }
    static calculateAverageCalories(nutritionData) {
        if (nutritionData.length === 0)
            return 0;
        const totalCalories = nutritionData.reduce((sum, day) => {
            return (sum +
                day.meals.reduce((daySum, meal) => {
                    return (daySum +
                        meal.foods.reduce((mealSum, food) => {
                            return (mealSum +
                                (food.food.calories * food.amount) / food.food.servingSize);
                        }, 0));
                }, 0));
        }, 0);
        return Math.round(totalCalories / nutritionData.length);
    }
    static calculateAverageMacros(nutritionData) {
        if (nutritionData.length === 0) {
            return { protein: 0, carbs: 0, fat: 0 };
        }
        let totals = { protein: 0, carbs: 0, fat: 0 };
        let days = 0;
        nutritionData.forEach((day) => {
            let dayTotals = { protein: 0, carbs: 0, fat: 0 };
            day.meals.forEach((meal) => {
                meal.foods.forEach((food) => {
                    const multiplier = food.amount / food.food.servingSize;
                    dayTotals.protein += food.food.protein * multiplier;
                    dayTotals.carbs += food.food.carbs * multiplier;
                    dayTotals.fat += food.food.fat * multiplier;
                });
            });
            const dayTotal = dayTotals.protein + dayTotals.carbs + dayTotals.fat;
            if (dayTotal > 0) {
                totals.protein += (dayTotals.protein / dayTotal) * 100;
                totals.carbs += (dayTotals.carbs / dayTotal) * 100;
                totals.fat += (dayTotals.fat / dayTotal) * 100;
                days++;
            }
        });
        return {
            protein: Math.round(totals.protein / days),
            carbs: Math.round(totals.carbs / days),
            fat: Math.round(totals.fat / days),
        };
    }
    static analyzeMealTiming(nutritionData) {
        let lateNightEating = false;
        let irregularMealTiming = false;
        nutritionData.forEach((day) => {
            day.meals.forEach((meal) => {
                const mealTime = new Date(meal.time).getHours();
                if (mealTime >= 22 || mealTime <= 5) {
                    lateNightEating = true;
                }
            });
        });
        return {
            lateNightEating,
            irregularMealTiming,
        };
    }
    static generateWeightRecommendations(weeklyChange, remainingChange) {
        const recommendations = [];
        // Güvenli kilo değişim aralıkları
        const safeWeeklyLoss = -1.0; // kg
        const safeWeeklyGain = 0.5; // kg
        if (remainingChange < 0) {
            // Kilo vermesi gerekiyor
            if (weeklyChange > safeWeeklyLoss) {
                recommendations.push("Kilo verme hızınız güvenli aralığın altında. Kalori açığınızı artırmanızı öneririz.");
            }
            else if (weeklyChange < safeWeeklyLoss * 2) {
                recommendations.push("Kilo verme hızınız çok yüksek. Daha yavaş ve sürdürülebilir bir yaklaşım için kalori alımınızı biraz artırmanızı öneririz.");
            }
        }
        else {
            // Kilo alması gerekiyor
            if (weeklyChange < safeWeeklyGain) {
                recommendations.push("Kilo alma hızınız düşük. Kalori alımınızı artırmanızı öneririz.");
            }
            else if (weeklyChange > safeWeeklyGain * 2) {
                recommendations.push("Kilo alma hızınız çok yüksek. Daha sağlıklı bir kilo alımı için kalori alımınızı azaltmanızı öneririz.");
            }
        }
        return recommendations;
    }
}
exports.AnalyticsService = AnalyticsService;
