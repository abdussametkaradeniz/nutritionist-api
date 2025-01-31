import { PrismaClient } from "@prisma/client";
import {
  CreateSessionRequest,
  UpdateSessionRequest,
} from "../../types/session";

const prisma = new PrismaClient();

export class SessionDbManager {
  async createSession(data: CreateSessionRequest) {
    return await prisma.session.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getSession(sessionId: string) {
    return await prisma.session.findUnique({
      where: { id: sessionId },
    });
  }

  async getUserSessions(userId: number) {
    return await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }

  async updateSession(sessionId: string, data: UpdateSessionRequest) {
    return await prisma.session.update({
      where: { id: sessionId },
      data,
    });
  }

  async deactivateSession(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async deactivateUserSessions(userId: number) {
    return await prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async cleanupInactiveSessions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await prisma.session.deleteMany({
      where: {
        OR: [{ isActive: false }, { lastActivity: { lt: thirtyDaysAgo } }],
      },
    });
  }
}
