import { GeneralAppointmentType } from "../../types/appointments/generalAppointmentType";
import { AppointmentDbManager } from "../../database/appointmentDbManager";

export class AppointmentManager {
  request?: GeneralAppointmentType;
  appointmentDbManager: AppointmentDbManager;

  constructor(request?: GeneralAppointmentType) {
    this.request = request;
    this.appointmentDbManager = new AppointmentDbManager();
  }

  async createAppointment(): Promise<any> {}

  async updateAppointment(): Promise<any> {}

  async getAllAppointment(): Promise<any> {}

  async approveAppointment(): Promise<any> {}

  async rejectAppointment(): Promise<any> {}

  async sendNotificationForAppointment(): Promise<any> {}
}
