import express, { Request, Response, NextFunction } from "express";
import { ProfileFields } from "../../types/profile";
import ProfileManager from "../../bussiness/profile/profileManager";

const router: express.Router = express.Router();

router.get(
  "/",
  // requestValidator(postSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ",req.body);
    const request = req.body as ProfileFields;
    const profile  = await new ProfileManager(request).getUserProfile(request.id);
    res.send(profile);
  }
)



export default router
