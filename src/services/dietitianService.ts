import { BusinessException } from "../domain/exception";
import prisma from "../../prisma/client";
import { Prisma, Specialization, WeekDay } from "@prisma/client";
import { AppError } from "../utils/appError";
export class DietitianService {
  // Profil işlemleri
  static async createProfile(
    userId: number,
    data: Prisma.DietitianProfileCreateInput
  ) {
    // Kullanıcının zaten profili var mı kontrol et
    const existingProfile = await prisma.dietitianProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new AppError("Profile already exists", 400);
    }

    return await prisma.dietitianProfile.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  static async getProfile(userId: number) {
    const profile = await prisma.dietitianProfile.findUnique({
      where: { userId },
      include: {
        workingHours: true,
        pricingPackages: true,
      },
    });

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    return profile;
  }

  static async updateProfile(
    userId: number,
    data: Prisma.DietitianProfileUpdateInput
  ) {
    const profile = await prisma.dietitianProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError("Profile not found", 404);
    }

    return await prisma.dietitianProfile.update({
      where: { userId },
      data,
    });
  }

  // Uzmanlık alanları işlemleri
  static async addSpecialty(userId: number, specialtyId: Specialization) {
    const profile = await this.getProfile(userId);

    const existingSpecialty = profile.specializations.some(
      (specialty) => specialty === specialtyId
    );
    if (existingSpecialty) {
      throw new AppError("This specialization already exists", 400);
    }

    return await prisma.dietitianProfile.update({
      where: { id: profile.id },
      data: {
        specializations: {
          push: specialtyId,
        },
      },
    });
  }

  static async removeSpecialty(userId: number, specialtyId: Specialization) {
    const profile = await this.getProfile(userId);

    return await prisma.dietitianProfile.update({
      where: { id: profile.id },
      data: {
        specializations: {
          set: profile.specializations.filter((s) => s !== specialtyId),
        },
      },
    });
  }

  // Çalışma saatleri işlemleri
  static async addWorkingHours(
    userId: number,
    data: Prisma.WorkingHoursCreateInput
  ) {
    const profile = await this.getProfile(userId);

    // Çakışma kontrolü
    if (await this.hasTimeConflict(profile.id, data)) {
      throw new AppError(
        "Bu zaman diliminde başka bir çalışma saati mevcut",
        400
      );
    }

    return await prisma.workingHours.create({
      data: {
        ...data,
        dietitian: { connect: { id: profile.id } },
      },
    });
  }

  static async updateWorkingHours(
    userId: number,
    workingHours: Prisma.WorkingHoursCreateInput[]
  ) {
    const profile = await this.getProfile(userId);

    // Önce mevcut çalışma saatlerini sil
    await prisma.workingHours.deleteMany({
      where: { dietitianId: profile.id },
    });

    // Yeni çalışma saatlerini ekle
    return await prisma.workingHours.createMany({
      data: workingHours.map((hour) => ({
        ...hour,
        dietitianId: profile.id,
      })),
    });
  }

  static async deleteWorkingHours(userId: number, hourId: number) {
    const profile = await this.getProfile(userId);
    return await prisma.workingHours.delete({
      where: { id: String(hourId), dietitianId: profile.id },
    });
  }

  // Fiyatlandırma işlemleri
  static async addPricingPackage(
    userId: number,
    data: Prisma.PricingPackageCreateInput
  ) {
    const profile = await this.getProfile(userId);

    return await prisma.pricingPackage.create({
      data: {
        ...data,
        dietitian: { connect: { id: profile.id } },
      },
    });
  }

  static async createPricingPackage(
    userId: number,
    data: Prisma.PricingPackageCreateInput
  ) {
    const profile = await this.getProfile(userId);

    return await prisma.pricingPackage.create({
      data: {
        ...data,
        dietitian: { connect: { id: profile.id } },
      },
    });
  }

  static async updatePricingPackage(
    userId: number,
    packageId: string,
    data: Prisma.PricingPackageUpdateInput
  ) {
    const profile = await this.getProfile(userId);
    const pricingPackage = await prisma.pricingPackage.findFirst({
      where: {
        id: packageId,
        dietitianId: profile.id,
      },
    });

    if (!pricingPackage) {
      throw new AppError("Pricing package not found", 404);
    }

    return await prisma.pricingPackage.update({
      where: { id: packageId },
      data,
    });
  }

  static async deletePricingPackage(userId: number, packageId: string) {
    const profile = await this.getProfile(userId);
    const pricingPackage = await prisma.pricingPackage.findFirst({
      where: {
        id: packageId,
        dietitianId: profile.id,
      },
    });

    if (!pricingPackage) {
      throw new AppError("Pricing package not found", 404);
    }

    return await prisma.pricingPackage.delete({
      where: { id: packageId },
    });
  }

  static async getPricingPackages(userId: number) {
    const profile = await this.getProfile(userId);

    return await prisma.pricingPackage.findMany({
      where: { dietitianId: profile.id },
    });
  }

  // Yardımcı metodlar
  private static async hasTimeConflict(
    profileId: string,
    newSchedule: Prisma.WorkingHoursCreateInput & { day: WeekDay }
  ): Promise<boolean> {
    const existingHours = await prisma.workingHours.findMany({
      where: { dietitianId: profileId },
    });

    return existingHours.some(
      (schedule) =>
        schedule.day === newSchedule.day &&
        ((schedule.startTime <= newSchedule.startTime &&
          schedule.endTime > newSchedule.startTime) ||
          (schedule.startTime < newSchedule.endTime &&
            schedule.endTime >= newSchedule.endTime))
    );
  }

  static async searchDietitians(params: {
    specialization?: Specialization;
    minPrice?: number;
    maxPrice?: number;
    availableDay?: string;
    availableTime?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      specialization,
      minPrice,
      maxPrice,
      availableDay,
      availableTime,
      page = 1,
      limit = 10,
    } = params;

    const where: Prisma.DietitianProfileWhereInput = {
      AND: [
        specialization
          ? {
              specializations: {
                has: specialization,
              },
            }
          : {},
        minPrice || maxPrice
          ? {
              pricingPackages: {
                some: {
                  AND: [
                    minPrice ? { price: { gte: minPrice } } : {},
                    maxPrice ? { price: { lte: maxPrice } } : {},
                  ],
                },
              },
            }
          : {},
        availableDay
          ? {
              workingHours: {
                some: {
                  AND: [{ day: availableDay as any }, { isAvailable: true }],
                },
              },
            }
          : {},
      ],
    };

    const [dietitians, total] = await Promise.all([
      prisma.dietitianProfile.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
          workingHours: true,
          pricingPackages: {
            where: { isActive: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          rating: "desc",
        },
      }),
      prisma.dietitianProfile.count({ where }),
    ]);

    return {
      data: dietitians,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDietitiansBySpecialization(specialization: Specialization) {
    return await prisma.dietitianProfile.findMany({
      where: {
        specializations: {
          has: specialization,
        },
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  static async getWorkingHours(dietitianId: string) {
    return await prisma.workingHours.findMany({
      where: {
        dietitianId,
      },
      orderBy: {
        day: "asc",
      },
    });
  }
}
