import { Prisma, GoalStatus } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";

export class GoalService {
  // Hedef oluştur
  static async createGoal(data: {
    userId: number;
    dietitianId?: number;
    startDate: Date;
    targetDate: Date;
    startWeight?: number;
    targetWeight?: number;
    calorieTarget?: number;
    proteinTarget?: number;
    carbTarget?: number;
    fatTarget?: number;
    notes?: string;
  }) {
    return await prisma.goal.create({
      data: {
        ...data,
        status: GoalStatus.ACTIVE,
      },
    });
  }

  // Hedefleri listele
  static async getGoals(params: {
    userId: number;
    status?: GoalStatus;
    page?: number;
    limit?: number;
  }) {
    const { userId, status, page = 1, limit = 10 } = params;

    const where: Prisma.GoalWhereInput = {
      userId,
      ...(status && { status }),
    };

    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy: {
          startDate: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.goal.count({ where }),
    ]);

    return {
      data: goals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Hedef durumunu güncelle
  static async updateGoalStatus(
    goalId: number,
    userId: number,
    status: GoalStatus
  ) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new AppError("Hedef bulunamadı", 404);
    }

    return await prisma.goal.update({
      where: { id: goalId },
      data: { status },
    });
  }

  // Hedef ilerleme durumunu hesapla
  static async calculateProgress(goalId: number) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new AppError("Hedef bulunamadı", 404);
    }

    const latestProgress = await prisma.progress.findFirst({
      where: { userId: goal.userId },
      orderBy: { date: "desc" },
    });

    if (!latestProgress || !goal.targetWeight) {
      return null;
    }

    const totalWeightGoal = goal.targetWeight - goal.startWeight!;
    const currentProgress = latestProgress.weight! - goal.startWeight!;
    const progressPercentage = (currentProgress / totalWeightGoal) * 100;

    return {
      currentWeight: latestProgress.weight,
      targetWeight: goal.targetWeight,
      progressPercentage: Math.min(Math.max(progressPercentage, 0), 100),
      remainingDays: Math.ceil(
        (goal.targetDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }
}
