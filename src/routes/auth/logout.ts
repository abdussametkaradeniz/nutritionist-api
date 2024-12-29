import express, { Request, Response } from "express";
import { sendSuccess } from "../../helpers/responseHandler";

const router: express.Router = express.Router();

router.post("/", (req: Request, res: Response) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendSuccess(res, null, "Logout successful");
});

export default router;
