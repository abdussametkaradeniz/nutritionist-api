import express, { Request, Response, NextFunction } from "express";
import { loginSchema } from "../../validations/auth/loginValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { LoginManager } from "../../bussiness/auth/loginManager";
import { UserLoginFields } from "../../types/login";
import { generateToken } from "../../helpers/jwt"

import { InvalidParameter, NotFound } from "../../domain/exception";

const router: express.Router = express.Router();

router.post(
  "/",
  requestValidator(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ",req.body);
    const request = req.body as UserLoginFields;
    const user  = await new LoginManager(request).findUniqueUser();
    res.send(user);
  }
); 


export default router;
