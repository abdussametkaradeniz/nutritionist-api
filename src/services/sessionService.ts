import prisma from "../../prisma/client";
import { BusinessException } from "../domain/exception";
import { CreateSessionRequest, UpdateSessionRequest } from "../types/session";

export class SessionService {
  async createSession(data: CreateSessionRequest) {
    return await prisma.session.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: true,
        dietitianId: data.dietitianId,
      },
    });
  }

  async getSession(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new BusinessException("Session not found", 404);
    }

    return session;
  }

  static async getUserSessions(userId: number) {
    return await prisma.session.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        deviceId: true,
        deviceType: true,
        lastActivity: true,
        isActive: true,
      },
    });
  }

  async updateSession(sessionId: string, data: UpdateSessionRequest) {
    // Session'ın varlığını kontrol et
    await this.getSession(sessionId);

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        deviceId: data.deviceId,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        lastActivity: new Date(),
        isActive: data.isActive,
      },
    });
  }

  async deactivateSession(sessionId: string) {
    // Session'ın varlığını kontrol et
    await this.getSession(sessionId);

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        lastActivity: new Date(),
      },
    });
  }

  async deactivateUserSessions(userId: number) {
    return await prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        lastActivity: new Date(),
      },
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

  static async deactivateSession(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  static async deactivateAllSessions(userId: number) {
    return await prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });
  }
}
