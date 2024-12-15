import express, { NextFunction, Request, Response } from "express";
import { requestValidator } from "../../middleware/requestValidator";
import { sendSuccess } from "../../helpers/responseHandler";
import { BusinessException, NotFound } from "../../domain/exception";
import { AppointmentValidateSchema } from "../../validations/appointments/appointmentValidator";
import { GeneralAppointmentType } from "../../types/appointments/generalAppointmentType";
import { AppointmentManager } from "../../bussiness/appointments/appointmentManager";

const router: express.Router = express.Router();

router.post(
  "/add-appointment",
  requestValidator(AppointmentValidateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as GeneralAppointmentType;
    try {
      const appointmentManager = new AppointmentManager(request);
      const result = await appointmentManager.createAppointment();
      sendSuccess(res, result, "permission created successfully");
    } catch (error) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.post(
  "/update-appointment",
  requestValidator(AppointmentValidateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as GeneralAppointmentType;
    try {
      const appointmentManager = new AppointmentManager(request);
      const result = await appointmentManager.createAppointment();
      sendSuccess(res, result, "permission created successfully");
    } catch (error) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  try {
    const appointmentManager = new AppointmentManager();
    const result = await appointmentManager.createAppointment();
    sendSuccess(res, result, "permission created successfully");
  } catch (error) {
    if (error instanceof NotFound || error instanceof BusinessException) {
      next(error);
    } else {
      next(error);
    }
  }
});

router.patch(
  "/reject-appointment",
  async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.body;

    try {
      const appointmentManager = new AppointmentManager();
      const result = await appointmentManager.rejectAppointment();
      sendSuccess(res, result, "permission deleted successfully");
    } catch (error) {
      if (error instanceof NotFound) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
