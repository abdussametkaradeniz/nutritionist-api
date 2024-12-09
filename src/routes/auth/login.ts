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
      const loginManager = new LoginManager(request);
      const result = await loginManager.findUniqueUser();

      res.cookie("authToken", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      sendSuccess(res, { user: result.user }, "Login successful");
    } catch (error: unknown) {
      if (error instanceof NotFound || error instanceof InvalidParameter) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
