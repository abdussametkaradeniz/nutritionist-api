import { PrismaClient } from "@prisma/client";
import { BusinessException } from "../../domain/exception";

const prisma = new PrismaClient();

export class ActivityLogDbManager {
  async logActivity(data: {
    userId: number;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await prisma.activityLog.create({
      data: {
        ...data,
        details: data.details ? data.details : undefined,
        lastUpdatingUser: data.userId.toString(),
      },
    });
  }

  async getUserActivities(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, activities] = await Promise.all([
      prisma.activityLog.count({
        where: { userId, recordStatus: "A" },
      }),
      prisma.activityLog.findMany({
        where: { userId, recordStatus: "A" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivityById(id: number, userId: number) {
    const activity = await prisma.activityLog.findFirst({
      where: {
        id,
        userId,
        recordStatus: "A",
      },
    });

    if (!activity) {
      throw new BusinessException("Aktivite bulunamadı", 404);
    }

    return activity;
  }

  async filterActivities(
    userId: number,
    filters: {
      action?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const { action, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      recordStatus: "A",
      ...(action && { action }),
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    };

    const [total, activities] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
