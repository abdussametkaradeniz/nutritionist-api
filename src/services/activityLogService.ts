import { ActivityLogDbManager } from "../database/user/activityLogDbManager";
import { BusinessException } from "../domain/exception";

export class ActivityLogService {
  private static activityLogDb = new ActivityLogDbManager();

  static async logActivity(data: {
    userId: number;
    action: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return await this.activityLogDb.logActivity(data);
  }

  static async getUserActivities(
    userId: number,
    page?: number,
    limit?: number
  ) {
    return await this.activityLogDb.getUserActivities(userId, page, limit);
  }

  static async getActivityById(id: number, userId: number) {
    return await this.activityLogDb.getActivityById(id, userId);
  }

  static async filterActivities(
    userId: number,
    filters: {
      action?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    // Tarih dönüşümlerini yap
    const parsedFilters = {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    // Tarih validasyonu
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

    return await this.activityLogDb.filterActivities(userId, parsedFilters);
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
