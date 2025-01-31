import { PrismaClient } from "@prisma/client";
import { CreateDietitianProfileRequest } from "../../types/dietitian";

const prisma = new PrismaClient();

export class DietitianDbManager {
  // Profil işlemleri
  async createProfile(userId: number, data: CreateDietitianProfileRequest) {
    return await prisma.dietitianProfile.create({
      data: {
        userId,
        bio: data.bio,
        education: data.education,
        experience: data.experience,
        about: data.about,
        specialties: data.specialties
          ? {
              create: data.specialties.map((specialtyId) => ({
                specialty: {
                  connect: { id: specialtyId },
                },
              })),
            }
          : undefined,
      },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        schedules: true,
        pricing: true,
      },
    });
  }

  async getProfile(userId: number) {
    return await prisma.dietitianProfile.findUnique({
      where: { userId },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        schedules: true,
        pricing: true,
      },
    });
  }

  async updateProfile(
    userId: number,
    data: Partial<CreateDietitianProfileRequest>
  ) {
    return await prisma.dietitianProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        education: data.education,
        experience: data.experience,
        about: data.about,
      },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
        schedules: true,
        pricing: true,
      },
    });
  }

  // Uzmanlık alanları işlemleri
  async addSpecialty(profileId: number, specialtyId: number) {
    return await prisma.dietitianSpecialty.create({
      data: {
        dietitianId: profileId,
        specialtyId,
      },
      include: {
        specialty: true,
      },
    });
  }

  async removeSpecialty(profileId: number, specialtyId: number) {
    return await prisma.dietitianSpecialty.deleteMany({
      where: {
        dietitianId: profileId,
        specialtyId,
      },
    });
  }

  // Çalışma saatleri işlemleri
  async addWorkingHours(
    profileId: number,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }
  ) {
    return await prisma.workingHours.create({
      data: {
        dietitianId: profileId,
        ...data,
      },
    });
  }

  async updateWorkingHours(
    id: number,
    data: {
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    }
  ) {
    return await prisma.workingHours.update({
      where: { id },
      data,
    });
  }

  async deleteWorkingHours(id: number) {
    return await prisma.workingHours.delete({
      where: { id },
    });
  }

  // Fiyatlandırma işlemleri
  async addPricingPackage(
    profileId: number,
    data: {
      name: string;
      description?: string;
      duration: number;
      price: number;
      isActive?: boolean;
    }
  ) {
    return await prisma.pricingPackage.create({
      data: {
        dietitianId: profileId,
        ...data,
      },
    });
  }

  async updatePricingPackage(
    id: number,
    data: {
      name?: string;
      description?: string;
      duration?: number;
      price?: number;
      isActive?: boolean;
    }
  ) {
    return await prisma.pricingPackage.update({
      where: { id },
      data,
    });
  }

  async deletePricingPackage(id: number) {
    return await prisma.pricingPackage.delete({
      where: { id },
    });
  }
}
