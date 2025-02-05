import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";

export class ReportService {
  // Haftalık/aylık özet raporu
  static async generateSummaryReport(params: {
    userId: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { userId, startDate, endDate } = params;

    // İlerleme verileri
    const progress = await prisma.progress.findMany({
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
    const mealPlans = await prisma.mealPlan.findMany({
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
    const goals = await prisma.goal.findMany({
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
        weightChange:
          progress.length >= 2
            ? progress[progress.length - 1].weight! - progress[0].weight!
            : null,
        measurements: {
          chest: this.calculateChange(progress, "chest"),
          waist: this.calculateChange(progress, "waist"),
          hip: this.calculateChange(progress, "hip"),
          arm: this.calculateChange(progress, "arm"),
          thigh: this.calculateChange(progress, "thigh"),
        },
      },
      nutrition: await this.calculateAverageNutrition(mealPlans),
      goals: goals.map((goal) => ({
        ...goal,
        progress: this.calculateGoalProgress(goal, progress),
      })),
    };

    return summary;
  }

  // Besin tüketim analizi
  static async generateNutritionReport(params: {
    userId: number;
    startDate: Date;
    endDate: Date;
  }) {
    const { userId, startDate, endDate } = params;

    const mealPlans = await prisma.mealPlan.findMany({
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
    const dailyAverages = await this.calculateAverageNutrition(mealPlans);

    // En çok tüketilen besinler
    const topFoods = await this.calculateTopFoods(mealPlans);

    // Makro besin dağılımı
    const macroDistribution = this.calculateMacroDistribution(dailyAverages);

    return {
      dailyAverages,
      topFoods,
      macroDistribution,
    };
  }

  // Yardımcı fonksiyonlar
  private static calculateChange(data: any[], field: string) {
    if (data.length < 2) return null;
    const first = data[0][field];
    const last = data[data.length - 1][field];
    return first && last ? last - first : null;
  }

  private static async calculateAverageNutrition(mealPlans: any[]) {
    let totalDays = 0;
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    mealPlans.forEach((plan) => {
      plan.meals.forEach((meal: any) => {
        meal.foods.forEach((mealFood: any) => {
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
  }

  private static calculateMacroDistribution(nutrition: any) {
    if (!nutrition) return null;

    const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fat;
    return {
      protein: Math.round((nutrition.protein / totalMacros) * 100),
      carbs: Math.round((nutrition.carbs / totalMacros) * 100),
      fat: Math.round((nutrition.fat / totalMacros) * 100),
    };
  }

  private static async calculateTopFoods(mealPlans: any[]) {
    const foodCounts: { [key: string]: number } = {};

    mealPlans.forEach((plan) => {
      plan.meals.forEach((meal: any) => {
        meal.foods.forEach((mealFood: any) => {
          const foodId = mealFood.food.id;
          foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;
        });
      });
    });

    const topFoodIds = Object.entries(foodCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([id]) => parseInt(id));

    return await prisma.food.findMany({
      where: {
        id: {
          in: topFoodIds,
        },
      },
    });
  }

  private static calculateGoalProgress(goal: any, progress: any[]) {
    if (!goal.targetWeight || progress.length === 0) return null;

    const latestProgress = progress[progress.length - 1];
    const totalWeightGoal = goal.targetWeight - goal.startWeight;
    const currentProgress = latestProgress.weight - goal.startWeight;

    return {
      currentWeight: latestProgress.weight,
      progressPercentage: Math.min(
        Math.max((currentProgress / totalWeightGoal) * 100, 0),
        100
      ),
      remainingDays: Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }
}
