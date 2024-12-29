import express, { NextFunction, Request, Response } from "express";
import { UserProcessManager } from "../../bussiness/users/userProcessManager";
import { sendSuccess } from "../../helpers/responseHandler";
import { NotFound, BusinessException } from "../../domain/exception";

const router: express.Router = express.Router();

router.post(
  "/link-user-to-dietitian",
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, dietitianId } = req.body;

    try {
      const userManager = new UserProcessManager();
      const result = await userManager.linkUserToDietitian(userId, dietitianId);
      sendSuccess(res, result, "User linked to dietitian successfully");
    } catch (error) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.get(
  "/dietitian/:dietitianId/clients",
  async (req: Request, res: Response, next: NextFunction) => {
    const dietitianId = Number(req.params.dietitianId);

    try {
      const userManager = new UserProcessManager();
      const clients = await userManager.getClientsByDietitian(dietitianId);

      sendSuccess(res, clients, "Clients retrieved successfully");
    } catch (error) {
      if (error instanceof NotFound || error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
