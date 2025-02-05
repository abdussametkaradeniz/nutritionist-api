import { Prisma, AppointmentStatus, AppointmentType } from "@prisma/client";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
import { DietitianService } from "./dietitianService";

export class AppointmentService {
  static async createAppointment(
    clientId: number,
    data: {
      startTime: string;
      endTime: string;
      type: AppointmentType;
      notes?: string;
      dietitianId: number;
    }
  ) {
    // Diyetisyenin müsaitlik kontrolü
    const isAvailable = await this.checkDietitianAvailability(
      data.dietitianId,
      new Date(data.startTime),
      new Date(data.endTime)
    );

    if (!isAvailable) {
      throw new AppError(
        "Seçilen zaman diliminde diyetisyen müsait değil",
        400
      );
    }

    // Danışanın başka randevusu var mı kontrolü
    const hasConflict = await this.checkClientConflict(
      clientId,
      new Date(data.startTime),
      new Date(data.endTime)
    );

    if (hasConflict) {
      throw new AppError(
        "Seçilen zaman diliminde başka bir randevunuz var",
        400
      );
    }

    return await prisma.appointment.create({
      data: {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        type: data.type,
        notes: data.notes,
        clientId,
        dietitianId: data.dietitianId,
        status: AppointmentStatus.PENDING,
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        dietitian: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  static async updateAppointmentStatus(
    appointmentId: string,
    userId: number,
    data: {
      status: AppointmentStatus;
      cancelReason?: string;
    }
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        dietitian: true,
      },
    });

    if (!appointment) {
      throw new AppError("Randevu bulunamadı", 404);
    }

    // Yetki kontrolü
    if (appointment.clientId !== userId && appointment.dietitianId !== userId) {
      throw new AppError("Bu işlem için yetkiniz yok", 403);
    }

    // İptal edilmiş randevu tekrar güncellenemez
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError("İptal edilmiş randevu güncellenemez", 400);
    }

    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: data.status,
        cancelReason: data.cancelReason,
        cancelledBy:
          data.status === AppointmentStatus.CANCELLED
            ? userId.toString()
            : undefined,
      },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        dietitian: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  private static async checkDietitianAvailability(
    dietitianId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    // Çalışma saatleri kontrolü
    const workingHours = await DietitianService.getWorkingHours(
      dietitianId.toString()
    );
    const day = startTime
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();

    const isWorkingDay = workingHours.some(
      (wh) =>
        wh.day === day &&
        wh.isAvailable &&
        this.isTimeInRange(startTime, wh.startTime, wh.endTime) &&
        this.isTimeInRange(endTime, wh.startTime, wh.endTime)
    );

    if (!isWorkingDay) return false;

    // Randevu çakışması kontrolü
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        dietitianId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    return !conflictingAppointment;
  }

  private static async checkClientConflict(
    clientId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        clientId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    return !!conflictingAppointment;
  }

  private static isTimeInRange(
    time: Date,
    start: string,
    end: string
  ): boolean {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const timeHour = time.getHours();
    const timeMinute = time.getMinutes();

    const timeInMinutes = timeHour * 60 + timeMinute;
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  }

  static async getAppointments(
    userId: number,
    filters: {
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
      type?: AppointmentType;
      page?: number;
      limit?: number;
    }
  ) {
    const { status, startDate, endDate, type, page = 1, limit = 10 } = filters;

    const where: Prisma.AppointmentWhereInput = {
      OR: [{ clientId: userId }, { dietitianId: userId }],
      AND: [
        status ? { status } : {},
        startDate ? { startTime: { gte: new Date(startDate) } } : {},
        endDate ? { endTime: { lte: new Date(endDate) } } : {},
        type ? { type } : {},
      ],
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: {
            select: {
              fullName: true,
              email: true,
            },
          },
          dietitian: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getAppointmentById(appointmentId: string, userId: number) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
        dietitian: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError("Randevu bulunamadı", 404);
    }

    // Yetki kontrolü
    if (appointment.clientId !== userId && appointment.dietitianId !== userId) {
      throw new AppError("Bu randevuyu görüntüleme yetkiniz yok", 403);
    }

    return appointment;
  }
}
