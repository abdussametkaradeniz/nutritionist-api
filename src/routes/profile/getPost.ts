import express, { Request, Response } from "express";
import { PostFields } from "../../types/profile";
import ProfileManager from "../../bussiness/profile/profileManager";

const router: express.Router = express.Router();

router.get("/");

export default router;
