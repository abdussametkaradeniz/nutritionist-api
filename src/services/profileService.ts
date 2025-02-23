import { BusinessException } from "../domain/exception";
import {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ChangePasswordRequest,
} from "../types/request/profile";
import { comparePassword, hashPassword } from "../helpers/password";
import { uploadToS3, deleteFromS3 } from "../helpers/s3";
import prisma from "prisma/client";
export class ProfileService {
  static async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true, // Profil bilgilerini de getir
        preferences: true, // Kullanıcı tercihlerini de getir
      },
    });
  }

  static async updateProfile(userId: number, data: any) {
    return await prisma.profile.update({
      where: { userId: userId },
      data: data,
    });
  }

  static async updatePreferences(userId: number, preferencesData: any) {
    return await prisma.userPreferences.update({
      where: { userId: userId },
      data: preferencesData,
    });
  }

  static async changePassword(userId: number, newPassword: string) {
    const newPasswordHash = await hashPassword(newPassword); // Yeni şifreyi hashle
    return await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  static async updateAvatar(userId: number, avatarUrl: string) {
    return await prisma.profile.update({
      where: { userId: userId },
      data: { photoUrl: avatarUrl },
    });
  }

  static async deleteAvatar(userId: number) {
    return await prisma.profile.update({
      where: { userId: userId },
      data: { photoUrl: null },
    });
  }

  static async deleteAccount(userId: number) {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }

  static async getPreferences(userId: number) {
    return await prisma.userPreferences.findUnique({
      where: { userId: userId },
    });
  }
}
