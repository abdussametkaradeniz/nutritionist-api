import express, { Request, Response, NextFunction } from "express";
import { postSchema } from "../../validations/profile/profileValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { PostFields } from "../../types/profile";
import ProfileManager from "../../bussiness/profile/profileManager";

const router: express.Router = express.Router();

router.get(
  "/",
  // requestValidator(postSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ",req.body);
    const request = req.body as PostFields;
    const posts  = await new ProfileManager(request).getPostsByUserId(request.userId);
    res.send(posts);
  }
)


export default router
