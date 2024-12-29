import { PrismaClient } from "@prisma/client";

export class UserProcessDbManager {
  prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async linkUserToDietitian(userId: number, dietitianId: number): Promise<any> {
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: {
        dietitianId: dietitianId,
      },
    });
    return result;
  }

  async getClientsByDietitian(dietitianId: number) {
    return await this.prisma.user.findMany({
      where: {
        dietitianId: dietitianId,
      },
      include: {
        profile: true,
      },
    });
  }
}
