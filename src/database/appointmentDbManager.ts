import prisma from "../../prisma/client";
import { BusinessException, NotFound } from "../domain/exception";
import {
  AppointmentStatus,
  GeneralAppointmentType,
} from "../types/appointments/generalAppointmentType";
import { GeneralRoleType } from "../types/rolePermissions/generalRoleType";
import { RolePermissionsType } from "../types/rolePermissions/rolePermissionsType";

export class AppointmentDbManager {
  checkAppointmentUsersAreBusy = async (
    userId: number,
    dietitianId: number,
    appointmentDate: Date
  ) => {
    const sessions = await prisma.appointment.findMany({
      where: {
        userId: userId,
        dietitianId: dietitianId,
        date: appointmentDate,
        status: {
          in: ["PENDING"],
        },
      },
    });
    return sessions;
  };

  createAppointment = async (request: any) => {
    const session = await prisma.appointment.create({
      data: {
        ...request,
      },
    });
    return session;
  };

  updateAppointment = async (
    appointmentDate: Date,
    status: any,
    id: number
  ) => {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: status,
        date: appointmentDate,
        lastUpdateDate: new Date(),
        recordStatus: status === "CANCELLED" ? "P" : "A",
      },
    });
    return updatedAppointment;
  };

  listAppointments = async (
    page: number,
    pageSize: number,
    status?: AppointmentStatus,
    recordStatus?: string
  ) => {
    const skip = (page - 1) * pageSize;

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }
    if (recordStatus) {
      whereCondition.recordStatus = recordStatus;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy: {
          date: "desc",
        },
        select: {
          id: true,
          date: true,
          status: true,
          recordStatus: true,
          user: {
            select: {
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          dietitian: {
            select: {
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.appointment.count({
        where: whereCondition,
      }),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  };

  approveAppointment = async (appointmentId: number) => {
    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CONFIRMED",
        lastUpdateDate: new Date(),
      },
    });
  };

  rejectAppointment = async (appointmentId: number) => {
    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        lastUpdateDate: new Date(),
        recordStatus: "P",
      },
    });
  };

  async getAppointmentsByDietitian(dietitianId: number): Promise<any[]> {
    return await prisma.appointment.findMany({
      where: {
        dietitianId: dietitianId,
        recordStatus: "A",
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }
}
