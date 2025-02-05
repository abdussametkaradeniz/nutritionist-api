import { Prisma, Progress } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
import { uploadFile } from "./mediaService";

export class ProgressService {
  // İlerleme kaydı oluştur
  static async createProgress(
    userId: number,
    data: {
      date: Date;
      weight?: number;
      bodyFat?: number;
      muscle?: number;
      water?: number;
      chest?: number;
      waist?: number;
      hip?: number;
      arm?: number;
      thigh?: number;
      notes?: string;
      photos?: Array<{
        file: Express.Multer.File;
        type: string;
      }>;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      // İlerleme kaydı oluştur
      const progress = await tx.progress.create({
        data: {
          userId,
          date: data.date,
          weight: data.weight,
          bodyFat: data.bodyFat,
          muscle: data.muscle,
          water: data.water,
          chest: data.chest,
          waist: data.waist,
          hip: data.hip,
          arm: data.arm,
          thigh: data.thigh,
          notes: data.notes,
        },
      });

      // Fotoğrafları yükle
      if (data.photos?.length) {
        const photoPromises = data.photos.map(async (photo) => {
          const url = await uploadFile(
            photo.file,
            `progress/${userId}/${progress.id}`
          );
          return tx.progressPhoto.create({
            data: {
              progressId: progress.id,
              url,
              type: photo.type,
            },
          });
        });

        await Promise.all(photoPromises);
      }

      return await tx.progress.findUnique({
        where: { id: progress.id },
        include: {
          photos: true,
        },
      });
    });
  }

  // İlerleme kayıtlarını listele
  static async getProgress(params: {
    userId: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { userId, startDate, endDate, page = 1, limit = 10 } = params;

    const where: Prisma.ProgressWhereInput = {
      userId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } }),
    };

    const [progress, total] = await Promise.all([
      prisma.progress.findMany({
        where,
        include: {
          photos: true,
        },
        orderBy: {
          date: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.progress.count({ where }),
    ]);

    return {
      data: progress,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // İstatistikleri hesapla
  static async calculateStats(
    userId: number,
    period: {
      startDate: Date;
      endDate: Date;
    }
  ) {
    const progress = (await prisma.progress.findMany({
      where: {
        userId,
        date: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    })) as Progress[];

    if (!progress.length) {
      return null;
    }

    return {
      weightChange:
        progress[progress.length - 1]?.weight != null &&
        progress[0]?.weight != null
          ? progress[progress.length - 1].weight! - progress[0].weight
          : null,
      measurements: {
        chest: this.calculateChange(progress, "chest"),
        waist: this.calculateChange(progress, "waist"),
        hip: this.calculateChange(progress, "hip"),
        arm: this.calculateChange(progress, "arm"),
        thigh: this.calculateChange(progress, "thigh"),
      },
      composition: {
        bodyFat: this.calculateChange(progress, "bodyFat"),
        muscle: this.calculateChange(progress, "muscle"),
        water: this.calculateChange(progress, "water"),
      },
    };
  }

  private static calculateChange(progress: any[], field: string) {
    const first = progress[0][field];
    const last = progress[progress.length - 1][field];
    return first && last ? last - first : null;
  }
}
