import express, { Request, Response, NextFunction } from "express";
import { PostFields, ProfileFields } from "../../types/profile";
import ProfileManager from "../../bussiness/profile/profileManager";

const router: express.Router = express.Router();
router.get(
  "/addPost",
  // requestValidator(postSchema),
  async (req: Request, res: Response): Promise<void> => {
    console.log("body ekrana yazdırıldı ",req.body);
    const request = req.body as PostFields;
    const mainposts  = await new ProfileManager(request).createPost(request);
    res.send(mainposts);
  },
);

router.get(
    "/getPost",
    async (req: Request, res: Response): Promise<void> => {
      console.log("body ekrana yazdırıldı ",req.body);
      const request = req.body as PostFields;
      const posts  = await new ProfileManager(request).getPostsByUserId(request.userId);
      res.send(posts);
    },
  );

  router.get(
    "/mainPost",
    // requestValidator(postSchema),
    async (req: Request, res: Response): Promise<void> => {
      console.log("body ekrana yazdırıldı ",req.body);
      const request = req.body as PostFields;
      const mainposts  = await new ProfileManager(request).getMainPosts(request.userId);
      res.send(mainposts);
    },
  );

  router.get(
    "/profileCover",
    // requestValidator(postSchema),
    async (req: Request, res: Response): Promise<void> => {
      console.log("body ekrana yazdırıldı ",req.body);
      const request = req.body as ProfileFields;
      const profile  = await new ProfileManager(request).getUserProfile(request.id);
      res.send(profile);
    },
  );

export default router