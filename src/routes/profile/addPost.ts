import express, { Request, Response, NextFunction } from "express";
import { PostFields } from "../../types/profile";
import ProfileManager from "../../bussiness/profile/profileManager";

const router: express.Router = express.Router();
router.get(
  "/",
  // requestValidator(postSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ",req.body);
    const request = req.body as PostFields;
    const mainposts  = await new ProfileManager(request).createPost(request);
    res.send(mainposts);
  },
);

export default router

