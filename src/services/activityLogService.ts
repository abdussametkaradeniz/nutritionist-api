import {
  ActivityLogRepository,
  ActivityFilters,
} from "../repositories/activityLogRepository";
import { BusinessException } from "../domain/exception";

export class ActivityLogService {
  static async logActivity(data: {
    userId: number;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await ActivityLogRepository.create(data);
  }

  static async getActivityById(id: number, userId: number) {
    return await ActivityLogRepository.findById(id, userId);
  }

  static async getUserActivities(userId: number, page = 1, limit = 10) {
    return await ActivityLogRepository.findByUserId(userId, page, limit);
  }

  static async filterActivities(userId: number, filters: ActivityFilters) {
    const parsedFilters: ActivityFilters = { ...filters };

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (isNaN(startDate.getTime())) {
        throw new BusinessException("Geçersiz başlangıç tarihi formatı", 400);
      }
      parsedFilters.startDate = startDate;
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      if (isNaN(endDate.getTime())) {
        throw new BusinessException("Geçersiz bitiş tarihi formatı", 400);
      }
      parsedFilters.endDate = endDate;
    }

    if (
      parsedFilters.startDate &&
      parsedFilters.endDate &&
      parsedFilters.startDate > parsedFilters.endDate
    ) {
      throw new BusinessException(
        "Başlangıç tarihi bitiş tarihinden büyük olamaz",
        400
      );
    }

    return await ActivityLogRepository.findWithFilters(userId, parsedFilters);
  }

  // Yardımcı metodlar
  static async logProfileUpdate(
    userId: number,
    changes: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.logActivity({
      userId,
      action: "PROFILE_UPDATE",
      details: { changes },
      ipAddress,
      userAgent,
    });
  }

  static async logPasswordChange(
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.logActivity({
      userId,
      action: "PASSWORD_CHANGE",
      ipAddress,
      userAgent,
    });
  }

  static async logAvatarUpdate(
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.logActivity({
      userId,
      action: "AVATAR_UPDATE",
      ipAddress,
      userAgent,
    });
  }

  static async logPreferencesUpdate(
    userId: number,
    changes: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.logActivity({
      userId,
      action: "PREFERENCES_UPDATE",
      details: { changes },
      ipAddress,
      userAgent,
    });
  }

  static async logAccountDeletion(
    userId: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    return await this.logActivity({
      userId,
      action: "ACCOUNT_DELETION",
      ipAddress,
      userAgent,
    });
  }
}
