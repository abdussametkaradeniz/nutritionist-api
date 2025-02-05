import { PrismaClient, Session } from "@prisma/client";

export class SessionRepository {
  private static prisma = new PrismaClient().session;

  static async deactivateSession(sessionId: string): Promise<Session> {
    return await this.prisma.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  static async deactivateAllSessions(userId: number): Promise<void> {
    await this.prisma.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  static async getUserSessions(userId: number): Promise<Session[]> {
    return await this.prisma.findMany({
      where: {
        userId,
        isActive: true,
      },
    });
  }
}
