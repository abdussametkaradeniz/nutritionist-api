import express, { Request, Response } from "express";
import { registerSchema } from "../../validations/auth/registerValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { UserFields } from "../../types/user";
import { RegisterManager } from "../../bussiness/auth/registerManager";

const router: express.Router = express.Router();

router.post(
  "/",
  requestValidator(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ", req.body);
    const request = req.body as UserFields;
    const user = await new RegisterManager(request).create();
    res.send(user);
  }
);

export default router;
