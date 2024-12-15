import Joi from "joi";
import { AppointmentStatus } from "../../types/appointments/generalAppointmentType";
export const AppointmentValidateSchema = Joi.object({
  id: Joi.number().integer().positive(), // Otomatik artan bir sayı
  userId: Joi.number().integer().positive().required(), // Zorunlu kullanıcı ID
  dietitianId: Joi.number().integer().positive().required(), // İsteğe bağlı diyetisyen ID
  date: Joi.date().iso().required(), // ISO formatında zorunlu tarih
  status: Joi.string()
    .valid(...Object.values(AppointmentStatus))
    .default(AppointmentStatus.PENDING), // Varsayılan değer PENDING
  lastUpdatingUser: Joi.string().optional(), // İsteğe bağlı son güncelleyen kullanıcı
  lastUpdateDate: Joi.date().iso().optional(), // ISO formatında son güncelleme tarihi
  recordStatus: Joi.string().default("A"), // Varsayılan değer 'A'
});
