import {
  AppointmentStatus,
  GeneralAppointmentType,
} from "../../types/appointments/generalAppointmentType";
import { AppointmentDbManager } from "../../database/appointmentDbManager";
import { BusinessException } from "../../domain/exception";
import { NotFound } from "../../domain/exception";

export class AppointmentManager {
  request?: GeneralAppointmentType;
  appointmentDbManager: AppointmentDbManager;

  constructor(request?: GeneralAppointmentType) {
    this.request = request;
    this.appointmentDbManager = new AppointmentDbManager();
  }

  async createAppointment(): Promise<any> {
    //daha önceden set edilen bir toplantı var mı ona bak
    const currentSessions =
      await this.appointmentDbManager.checkAppointmentUsersAreBusy(
        this.request?.userId!,
        this.request?.dietitianId!,
        this.request?.date!
      );
    if (currentSessions) {
      throw new BusinessException("User have appointment", 400);
    }
    //toplantıyı oluştur.
    const createdSession = await this.appointmentDbManager.createAppointment(
      this.request
    );
    return createdSession;
  }

  async updateAppointment(): Promise<any> {
    const updatedSession = await this.appointmentDbManager.updateAppointment(
      this.request?.date!,
      this.request?.status!,
      this.request?.id!
    );

    if (!updatedSession) {
      throw new BusinessException("something went wrong", 400);
    }
    return updatedSession;
  }

  async getAllAppointment(): Promise<any> {}

  async approveAppointment(appointmentId: number): Promise<any> {
    const appointment =
      await this.appointmentDbManager.approveAppointment(appointmentId);

    if (!appointment) {
      throw new NotFound("Appointment not found");
    }

    if (appointment.status === "CANCELLED") {
      throw new BusinessException(
        "Cannot approve a cancelled appointment",
        400
      );
    }

    return appointment;
  }

  async rejectAppointment(appointmentId: number): Promise<any> {
    const appointment =
      await this.appointmentDbManager.rejectAppointment(appointmentId);

    if (!appointment) {
      throw new NotFound("Appointment not found");
    }

    if (appointment.status === "CONFIRMED") {
      throw new BusinessException("Cannot reject a confirmed appointment", 400);
    }

    return appointment;
  }

  async sendNotificationForAppointment(): Promise<any> {}

  async listAppointments(
    page: number,
    pageSize: number,
    status?: AppointmentStatus,
    recordStatus?: string
  ): Promise<any> {
    try {
      const result = await this.appointmentDbManager.listAppointments(
        page,
        pageSize,
        status,
        recordStatus
      );
      if (!result.appointments.length && page > 1) {
        throw new NotFound("No appointments found for this page");
      }
      return result;
    } catch (error) {
      if (error instanceof NotFound) {
        throw error;
      }
      throw new BusinessException("Error while fetching appointments", 500);
    }
  }
}
