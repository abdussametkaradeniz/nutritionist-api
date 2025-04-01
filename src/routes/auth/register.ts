import express, { Request, Response, NextFunction } from "express";
import { registerSchema } from "../../validations/auth/registerValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { RegisterManager } from "../../bussiness/auth/registerManager";
import { RegisterType } from "../../types/user/Register";
import { sendSuccess } from "../../helpers/responseHandler";
import {
  NotFound,
  InvalidParameter,
  BusinessException,
} from "../../domain/exception";

const router: express.Router = express.Router();

router.post(
  "/",
  requestValidator(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as RegisterType;
    try {
      const registerManager = new RegisterManager(request);
      console.log(request, "request in register route");
      const result = await registerManager.create();
      console.log(result, "result in register route");
      sendSuccess(res, { user: result }, "Register Successful");
    } catch (error: unknown) {
      console.log(error, "error in register route");
      if (
        error instanceof NotFound ||
        error instanceof InvalidParameter ||
        error instanceof BusinessException
      ) {
        next(error);
      } else {
        next(new Error("An unexpected error occurred"));
      }
    }
  }
);

export default router;
