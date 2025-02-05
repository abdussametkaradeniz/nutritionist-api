import { PrismaClient, ActivityLog } from "@prisma/client";

export interface ActivityFilters {
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class ActivityLogRepository {
  private static prisma = new PrismaClient().activityLog;

  static async create(data: {
    userId: number;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ActivityLog> {
    return await this.prisma.create({ data });
  }

  static async findById(
    id: number,
    userId: number
  ): Promise<ActivityLog | null> {
    return await this.prisma.findFirst({
      where: { id, userId },
    });
  }

  static async findByUserId(
    userId: number,
    page = 1,
    limit = 10
  ): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findWithFilters(
    userId: number,
    filters: ActivityFilters
  ): Promise<ActivityLog[]> {
    return await this.prisma.findMany({
      where: {
        userId,
        action: filters.action,
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      skip: ((filters.page || 1) - 1) * (filters.limit || 10),
      take: filters.limit || 10,
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
