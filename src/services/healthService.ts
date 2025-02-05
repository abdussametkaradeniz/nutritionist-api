import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
import { HealthAppProvider } from "@prisma/client";

export class HealthService {
  // Sağlık uygulaması bağlantısı
  static async connectHealthApp(params: {
    userId: number;
    provider: HealthAppProvider;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }) {
    const { userId, provider, accessToken, refreshToken, expiresAt } = params;

    return await prisma.healthAppConnection.create({
      data: {
        userId,
        provider,
        accessToken,
        refreshToken,
        expiresAt,
      },
    });
  }

  // Sağlık verisi senkronizasyonu
  static async syncHealthData(params: {
    userId: number;
    provider: HealthAppProvider;
    data: Array<{
      dataType: string;
      value: number;
      unit: string;
      timestamp: Date;
    }>;
  }) {
    const { userId, provider, data } = params;

    // Bağlantı kontrolü
    const connection = await prisma.healthAppConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (!connection) {
      throw new AppError("Sağlık uygulaması bağlantısı bulunamadı", 404);
    }

    // Verileri kaydet
    const healthData = await prisma.healthData.createMany({
      data: data.map((item) => ({
        userId,
        provider,
        ...item,
      })),
    });

    // Son senkronizasyon zamanını güncelle
    await prisma.healthAppConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        lastSync: new Date(),
      },
    });

    return healthData;
  }

  // Sağlık verilerini getir
  static async getHealthData(params: {
    userId: number;
    dataType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { userId, dataType, startDate, endDate } = params;

    return await prisma.healthData.findMany({
      where: {
        userId,
        ...(dataType && { dataType }),
        ...(startDate && {
          timestamp: {
            gte: startDate,
            ...(endDate && { lte: endDate }),
          },
        }),
      },
      orderBy: {
        timestamp: "desc",
      },
    });
  }

  // Bağlantıyı sil
  static async disconnectHealthApp(
    userId: number,
    provider: HealthAppProvider
  ) {
    return await prisma.healthAppConnection.deleteMany({
      where: {
        userId,
        provider,
      },
    });
  }
}
