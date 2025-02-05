import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";

export class AnalyticsService {
  // Trend Analizi
  static async analyzeTrends(params: {
    userId: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { userId, startDate, endDate } = params;

    // Kilo değişim trendi
    const weightTrend = await prisma.progress.findMany({
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
    const calorieTrend = await prisma.mealPlan.findMany({
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
  }

  // Tahminleme
  static async generatePredictions(params: { userId: number; goalId: number }) {
    const { userId, goalId } = params;

    // Hedef bilgilerini al
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new AppError("Hedef bulunamadı", 404);
    }

    // Son 30 günlük verileri al
    const recentProgress = await prisma.progress.findMany({
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
  }

  // Öneriler
  static async generateRecommendations(params: {
    userId: number;
    period?: number; // son kaç günlük veri analiz edilecek
  }) {
    const { userId, period = 30 } = params;

    // Beslenme verilerini al
    const nutritionData = await prisma.mealPlan.findMany({
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
    const progressData = await prisma.progress.findMany({
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
  }

  // Yardımcı fonksiyonlar
  private static calculateRegressionLine(data: any[]) {
    if (data.length < 2) return null;

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, point) => sum + point.weight!, 0);
    const sumXY = data.reduce((sum, point, i) => sum + i * point.weight!, 0);
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

  private static calculateDailyCalories(mealPlans: any[]) {
    return mealPlans.map((plan) => {
      const totalCalories = plan.meals.reduce((sum: number, meal: any) => {
        return (
          sum +
          meal.foods.reduce((mealSum: number, food: any) => {
            return (
              mealSum +
              (food.food.calories * food.amount) / food.food.servingSize
            );
          }, 0)
        );
      }, 0);

      return {
        date: plan.startDate,
        calories: Math.round(totalCalories),
      };
    });
  }

  private static calculateMacroTrend(mealPlans: any[]) {
    return mealPlans.map((plan) => {
      let totals = { protein: 0, carbs: 0, fat: 0 };

      plan.meals.forEach((meal: any) => {
        meal.foods.forEach((food: any) => {
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

  private static calculatePredictions(params: {
    goal: any;
    recentProgress: any[];
  }) {
    const { goal, recentProgress } = params;

    if (recentProgress.length < 2) {
      return null;
    }

    // Mevcut kilo değişim hızını hesapla
    const regression = this.calculateRegressionLine(recentProgress);
    if (!regression) return null;

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
      estimatedDate: new Date(
        Date.now() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000
      ),
      recommendations: this.generateWeightRecommendations(
        weeklyChange,
        remainingChange
      ),
    };
  }

  private static generatePersonalizedRecommendations(params: {
    nutritionData: any[];
    progressData: any[];
  }) {
    const { nutritionData, progressData } = params;

    const recommendations = {
      nutrition: [] as string[],
      activity: [] as string[],
      timing: [] as string[],
    };

    // Beslenme önerileri
    const avgCalories = this.calculateAverageCalories(nutritionData);
    const macroDistribution = this.calculateAverageMacros(nutritionData);

    if (avgCalories < 1200) {
      recommendations.nutrition.push(
        "Günlük kalori alımınız çok düşük görünüyor. Sağlıklı bir diyet için kalori alımınızı artırmanızı öneririz."
      );
    }

    if (macroDistribution.protein < 20) {
      recommendations.nutrition.push(
        "Protein alımınızı artırmanızı öneririz. Bu, kas kütlenizi korumaya ve tok hissetmenize yardımcı olacaktır."
      );
    }

    // Aktivite önerileri
    if (progressData.length >= 2) {
      const weightTrend = this.calculateRegressionLine(progressData);
      if (weightTrend && weightTrend.trend === "increasing") {
        recommendations.activity.push(
          "Son dönemde kilo alımı gözlemleniyor. Günlük aktivite seviyenizi artırmanızı öneririz."
        );
      }
    }

    // Öğün zamanlaması önerileri
    const mealTiming = this.analyzeMealTiming(nutritionData);
    if (mealTiming.lateNightEating) {
      recommendations.timing.push(
        "Geç saatlerde yemek yeme alışkanlığınız var. Öğünlerinizi daha erken saatlere kaydırmanızı öneririz."
      );
    }

    return recommendations;
  }

  private static calculateAverageCalories(nutritionData: any[]) {
    if (nutritionData.length === 0) return 0;

    const totalCalories = nutritionData.reduce((sum, day) => {
      return (
        sum +
        day.meals.reduce((daySum: number, meal: any) => {
          return (
            daySum +
            meal.foods.reduce((mealSum: number, food: any) => {
              return (
                mealSum +
                (food.food.calories * food.amount) / food.food.servingSize
              );
            }, 0)
          );
        }, 0)
      );
    }, 0);

    return Math.round(totalCalories / nutritionData.length);
  }

  private static calculateAverageMacros(nutritionData: any[]) {
    if (nutritionData.length === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }

    let totals = { protein: 0, carbs: 0, fat: 0 };
    let days = 0;

    nutritionData.forEach((day) => {
      let dayTotals = { protein: 0, carbs: 0, fat: 0 };
      day.meals.forEach((meal: any) => {
        meal.foods.forEach((food: any) => {
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

  private static analyzeMealTiming(nutritionData: any[]) {
    let lateNightEating = false;
    let irregularMealTiming = false;

    nutritionData.forEach((day) => {
      day.meals.forEach((meal: any) => {
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

  private static generateWeightRecommendations(
    weeklyChange: number,
    remainingChange: number
  ) {
    const recommendations = [];

    // Güvenli kilo değişim aralıkları
    const safeWeeklyLoss = -1.0; // kg
    const safeWeeklyGain = 0.5; // kg

    if (remainingChange < 0) {
      // Kilo vermesi gerekiyor
      if (weeklyChange > safeWeeklyLoss) {
        recommendations.push(
          "Kilo verme hızınız güvenli aralığın altında. Kalori açığınızı artırmanızı öneririz."
        );
      } else if (weeklyChange < safeWeeklyLoss * 2) {
        recommendations.push(
          "Kilo verme hızınız çok yüksek. Daha yavaş ve sürdürülebilir bir yaklaşım için kalori alımınızı biraz artırmanızı öneririz."
        );
      }
    } else {
      // Kilo alması gerekiyor
      if (weeklyChange < safeWeeklyGain) {
        recommendations.push(
          "Kilo alma hızınız düşük. Kalori alımınızı artırmanızı öneririz."
        );
      } else if (weeklyChange > safeWeeklyGain * 2) {
        recommendations.push(
          "Kilo alma hızınız çok yüksek. Daha sağlıklı bir kilo alımı için kalori alımınızı azaltmanızı öneririz."
        );
      }
    }

    return recommendations;
  }
}
