import { DietitianDbManager } from "../database/dietitian/dietitianDbManager";
import {
  CreateDietitianProfileRequest,
  CreateWorkingHoursRequest,
  CreatePricingPackageRequest,
} from "../types/dietitian";
import { BusinessException } from "../domain/exception";

export class DietitianService {
  private static dietitianDb = new DietitianDbManager();

  // Profil işlemleri
  static async createProfile(
    userId: number,
    data: CreateDietitianProfileRequest
  ) {
    const existingProfile = await this.dietitianDb.getProfile(userId);
    if (existingProfile) {
      throw new BusinessException(
        "Bu kullanıcı için zaten bir diyetisyen profili mevcut",
        400
      );
    }

    return await this.dietitianDb.createProfile(userId, data);
  }

  static async getProfile(userId: number) {
    const profile = await this.dietitianDb.getProfile(userId);
    if (!profile) {
      throw new BusinessException("Diyetisyen profili bulunamadı", 404);
    }
    return profile;
  }

  static async updateProfile(
    userId: number,
    data: Partial<CreateDietitianProfileRequest>
  ) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.updateProfile(userId, data);
  }

  // Uzmanlık alanları işlemleri
  static async addSpecialty(userId: number, specialtyId: number) {
    const profile = await this.getProfile(userId);

    const existingSpecialty = profile.specialties.find(
      (s) => s.specialtyId === specialtyId
    );
    if (existingSpecialty) {
      throw new BusinessException("Bu uzmanlık alanı zaten ekli", 400);
    }

    return await this.dietitianDb.addSpecialty(profile.id, specialtyId);
  }

  static async removeSpecialty(userId: number, specialtyId: number) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.removeSpecialty(profile.id, specialtyId);
  }

  // Çalışma saatleri işlemleri
  static async addWorkingHours(
    userId: number,
    data: CreateWorkingHoursRequest
  ) {
    const profile = await this.getProfile(userId);

    // Çakışma kontrolü
    if (await this.hasTimeConflict(profile.id, data)) {
      throw new BusinessException(
        "Bu zaman diliminde başka bir çalışma saati mevcut",
        400
      );
    }

    return await this.dietitianDb.addWorkingHours(profile.id, data);
  }

  static async updateWorkingHours(
    userId: number,
    hourId: number,
    data: Partial<CreateWorkingHoursRequest>
  ) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.updateWorkingHours(hourId, data);
  }

  static async deleteWorkingHours(userId: number, hourId: number) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.deleteWorkingHours(hourId);
  }

  // Fiyatlandırma işlemleri
  static async addPricingPackage(
    userId: number,
    data: CreatePricingPackageRequest
  ) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.addPricingPackage(profile.id, data);
  }

  static async updatePricingPackage(
    userId: number,
    packageId: number,
    data: Partial<CreatePricingPackageRequest>
  ) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.updatePricingPackage(packageId, data);
  }

  static async deletePricingPackage(userId: number, packageId: number) {
    const profile = await this.getProfile(userId);
    return await this.dietitianDb.deletePricingPackage(packageId);
  }

  // Yardımcı metodlar
  private static async hasTimeConflict(
    profileId: number,
    newSchedule: CreateWorkingHoursRequest
  ): Promise<boolean> {
    const profile = (await this.dietitianDb.getProfile(profileId))!;

    return profile.schedules.some(
      (schedule) =>
        schedule.dayOfWeek === newSchedule.dayOfWeek &&
        ((schedule.startTime <= newSchedule.startTime &&
          schedule.endTime > newSchedule.startTime) ||
          (schedule.startTime < newSchedule.endTime &&
            schedule.endTime >= newSchedule.endTime))
    );
  }
}
