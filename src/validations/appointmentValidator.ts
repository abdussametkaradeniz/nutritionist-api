import { z } from "zod";

export enum AppointmentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CANCELLED = "CANCELLED",
}

export const AppointmentValidateSchema = z.object({
  userId: z.number().int().positive(),
  dietitianId: z.number().int().positive(),
  date: z.string().datetime(),
  time: z.string(),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.PENDING),
  notes: z.string().optional(),
  lastUpdatingUser: z.string().optional(),
  lastUpdateDate: z.string().datetime().optional(),
  recordStatus: z.string().default("A"),
});
