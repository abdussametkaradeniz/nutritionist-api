import express, { NextFunction, Request, Response } from "express";
import { loginSchema } from "../../validations/auth/loginValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { LoginManager } from "../../bussiness/auth/loginManager";
import { UserLoginFields } from "../../types/login";
import { sendSuccess } from "../../helpers/responseHandler";
import { InvalidParameter, NotFound } from "../../domain/exception";

const router: express.Router = express.Router();

router.post(
  "/",
  requestValidator(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as UserLoginFields;
    try {
      console.log(request);
      const loginManager = new LoginManager(request);
      const result = await loginManager.findUniqueUser();

      sendSuccess(
        res,
        { user: result.user, token: result.token },
        "Login successful"
      );
    } catch (error: unknown) {
      if (error instanceof NotFound || error instanceof InvalidParameter) {
        next(error);
      } else {
        next(new Error("An unexpected error occurred"));
      }
    }
  }
);

export default router;
