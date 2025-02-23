import { z } from "zod";
import { AppointmentStatus, AppointmentType } from "@prisma/client";

export const createAppointmentSchema = z
  .object({
    startTime: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: "Randevu tarihi geçmiş bir tarih olamaz",
      }),

    endTime: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: "Randevu bitiş tarihi geçmiş bir tarih olamaz",
      }),

    type: z.nativeEnum(AppointmentType),
    notes: z.string().max(500).optional(),
    dietitianId: z.number(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır",
    }
  );

export const updateAppointmentSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
});

export const appointmentFilterSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(AppointmentType).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});
