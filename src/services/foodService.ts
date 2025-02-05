import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";

export class FoodService {
  // Besin kategorisi işlemleri
  static async createCategory(data: { name: string; description?: string }) {
    return await prisma.foodCategory.create({ data });
  }

  static async updateCategory(
    id: number,
    data: { name?: string; description?: string }
  ) {
    return await prisma.foodCategory.update({
      where: { id },
      data,
    });
  }

  static async getCategories() {
    return await prisma.foodCategory.findMany({
      include: {
        _count: {
          select: { foods: true },
        },
      },
    });
  }

  // Besin işlemleri
  static async createFood(data: {
    name: string;
    categoryId: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    servingSize: number;
    servingUnit: string;
  }) {
    const category = await prisma.foodCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Kategori bulunamadı", 404);
    }

    return await prisma.food.create({ data });
  }

  static async updateFood(id: number, data: Partial<Prisma.FoodUpdateInput>) {
    return await prisma.food.update({
      where: { id },
      data,
    });
  }

  static async getFoods(params: {
    search?: string;
    categoryId?: number;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, page = 1, limit = 20 } = params;

    const where: Prisma.FoodWhereInput = {
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(categoryId && { categoryId }),
    };

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
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
      prisma.food.count({ where }),
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
  }

  static async calculateNutrition(foodId: number, amount: number) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      throw new AppError("Besin bulunamadı", 404);
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
  }
}
