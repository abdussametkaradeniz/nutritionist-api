import { PrismaClient, User } from "@prisma/client";
import {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
} from "../types/request/profile";

export class ProfileRepository {
  private static prisma = new PrismaClient();

  static async getProfile(userId: number): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });
  }

  static async getPreferences(userId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        preferences: true,
      },
    });
    return user.preferences;
  }

  static async updateProfile(userId: number, data: UpdateProfileRequest) {
    return await this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async updatePreferences(
    userId: number,
    data: UpdatePreferencesRequest
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferences: {
          upsert: {
            create: data,
            update: data,
          },
        },
      },
    });
  }

  static async updateAvatar(userId: number, avatarUrl: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  static async deleteAvatar(userId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
  }

  static async deleteAccount(userId: number) {
    return await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
