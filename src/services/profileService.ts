import { BusinessException } from "../domain/exception";
import {
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ChangePasswordRequest,
} from "../types/request/profile";
import { comparePassword, hashPassword } from "../helpers/password";
import { uploadToS3, deleteFromS3 } from "../helpers/s3";
import { ProfileRepository } from "../repositories/profileRepository";

export class ProfileService {
  static async getProfile(userId: number) {
    return await ProfileRepository.getProfile(userId);
  }

  static async updateProfile(userId: number, data: UpdateProfileRequest) {
    return await ProfileRepository.updateProfile(userId, data);
  }

  static async updatePreferences(
    userId: number,
    data: UpdatePreferencesRequest
  ) {
    return await ProfileRepository.updatePreferences(userId, data);
  }

  static async changePassword(userId: number, data: ChangePasswordRequest) {
    const user = await ProfileRepository.getProfile(userId);

    const isValidPassword = await comparePassword(
      data.currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new BusinessException("Mevcut şifre yanlış", 400);
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new BusinessException("Yeni şifreler eşleşmiyor", 400);
    }

    if (data.currentPassword === data.newPassword) {
      throw new BusinessException(
        "Yeni şifre mevcut şifre ile aynı olamaz",
        400
      );
    }

    const newPasswordHash = await hashPassword(data.newPassword);
    return await ProfileRepository.updateProfile(userId, {
      passwordHash: newPasswordHash,
    });
  }

  static async updateAvatar(userId: number, file: Express.Multer.File) {
    // Avatar boyut kontrolü
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      throw new BusinessException("Avatar boyutu 5MB'dan büyük olamaz", 400);
    }

    // Dosya tipi kontrolü
    if (!file.mimetype.startsWith("image/")) {
      throw new BusinessException("Geçersiz dosya tipi", 400);
    }

    const avatarUrl = await uploadToS3(file, `avatars/${userId}`);
    return await ProfileRepository.updateAvatar(userId, avatarUrl);
  }

  static async deleteAvatar(userId: number) {
    const user = await ProfileRepository.getProfile(userId);
    if (user.avatarUrl) {
      await deleteFromS3(user.avatarUrl);
    }
    return await ProfileRepository.deleteAvatar(userId);
  }

  static async deleteAccount(userId: number) {
    // Avatar varsa sil
    const user = await ProfileRepository.getProfile(userId);
    if (user.avatarUrl) {
      await deleteFromS3(user.avatarUrl);
    }

    return await ProfileRepository.deleteAccount(userId);
  }

  static async getPreferences(userId: number) {
    const preferences = await ProfileRepository.getPreferences(userId);
    return preferences ?? {};
  }
}
