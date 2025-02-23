import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
import { FoodService } from "./foodService";

export class MealPlanService {
  // Öğün planı oluşturma
  static async createMealPlan(data: {
    userId: number;
    dietitianId?: number;
    startDate: Date;
    endDate?: Date;
    meals: Array<{
      name: string;
      time: Date;
      notes?: string;
      foods: Array<{
        foodId: number;
        amount: number;
        unit: string;
        notes?: string;
      }>;
    }>;
  }) {
    // Kullanıcı kontrolü
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }

    // Diyetisyen kontrolü
    if (data.dietitianId) {
      const dietitian = await prisma.user.findFirst({
        where: {
          id: data.dietitianId,
          role: {
            name: "DIETITIAN",
          },
        },
      });

      if (!dietitian) {
        throw new AppError("Diyetisyen bulunamadı", 404);
      }
    }

    // Öğün planı oluştur
    return await prisma.$transaction(async (tx) => {
      // Ana planı oluştur
      const mealPlan = await tx.mealPlan.create({
        data: {
          userId: data.userId,
          dietitianId: data.dietitianId,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });

      // Öğünleri ve besinleri ekle
      for (const meal of data.meals) {
        await tx.meal.create({
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

      return await tx.mealPlan.findUnique({
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
    });
  }

  // Öğün planı güncelleme
  static async updateMealPlan(
    id: number,
    userId: number,
    data: {
      endDate?: Date;
      isActive?: boolean;
      meals?: Array<{
        id?: number;
        name: string;
        time: Date;
        notes?: string;
        foods: Array<{
          id?: number;
          foodId: number;
          amount: number;
          unit: string;
          notes?: string;
        }>;
      }>;
    }
  ) {
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        OR: [{ userId }, { dietitianId: userId }],
      },
    });

    if (!mealPlan) {
      throw new AppError("Öğün planı bulunamadı", 404);
    }

    return await prisma.$transaction(async (tx) => {
      // Ana plan güncelleme
      await tx.mealPlan.update({
        where: { id },
        data: {
          endDate: data.endDate,
          isActive: data.isActive,
        },
      });

      if (data.meals) {
        // Mevcut öğünleri sil
        await tx.meal.deleteMany({
          where: { mealPlanId: id },
        });

        // Yeni öğünleri ekle
        for (const meal of data.meals) {
          await tx.meal.create({
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

      return await tx.mealPlan.findUnique({
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
    });
  }

  // Öğün planı listeleme
  static async getMealPlans(params: {
    userId: number;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      isActive,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = params;

    const where: Prisma.MealPlanWhereInput = {
      OR: [{ userId }, { dietitianId: userId }],
      ...(isActive !== undefined && { isActive }),
      ...(startDate && { startDate: { gte: startDate } }),
      ...(endDate && { endDate: { lte: endDate } }),
    };

    const [mealPlans, total] = await Promise.all([
      prisma.mealPlan.findMany({
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
      prisma.mealPlan.count({ where }),
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
  }

  // Günlük besin değeri hesaplama
  static async calculateDailyNutrition(mealPlanId: number, date: Date) {
    const meals = await prisma.meal.findMany({
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
        const nutrition = await FoodService.calculateNutrition(
          mealFood.food.id,
          mealFood.amount
        );

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
  }
}
