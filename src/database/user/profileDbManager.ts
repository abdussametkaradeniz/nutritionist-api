import { PrismaClient } from "@prisma/client";
import { BusinessException } from "../../domain/exception";
import {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
} from "../../types/request/profile";

const prisma = new PrismaClient();

export class ProfileDbManager {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new BusinessException("Kullanıcı bulunamadı", 404);
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileRequest) {
    // Email veya username değişiyorsa unique kontrolü yap
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== userId) {
        throw new BusinessException("Bu email adresi zaten kullanımda", 400);
      }
    }

    if (data.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUsername && existingUsername.id !== userId) {
        throw new BusinessException("Bu kullanıcı adı zaten kullanımda", 400);
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
      include: {
        preferences: true,
      },
    });
  }

  async updatePreferences(userId: number, data: UpdatePreferencesRequest) {
    return await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        ...data,
        userId,
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
      update: {
        ...data,
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl,
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  async deleteAvatar(userId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null,
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }

  async deleteAccount(userId: number) {
    // Soft delete
    return await prisma.user.update({
      where: { id: userId },
      data: {
        recordStatus: "D",
        lastUpdateDate: new Date(),
        lastUpdatingUser: userId.toString(),
      },
    });
  }
}
