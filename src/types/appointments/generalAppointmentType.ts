export type GeneralAppointmentType = {
  id?: number; // id alanı otomatik artıyor, bu yüzden isteğe bağlı
  userId: number; // kullanıcı zorunlu
  dietitianId?: number; // diyetisyen isteğe bağlı
  date: Date; // randevu tarihi
  status?: AppointmentStatus; // varsayılan olarak PENDING
  lastUpdatingUser?: string; // son güncelleyen kullanıcı isteğe bağlı
  lastUpdateDate?: Date; // son güncelleme tarihi otomatik olarak ekleniyor
  recordStatus?: string; // varsayılan olarak 'A'
};

export enum AppointmentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
}
