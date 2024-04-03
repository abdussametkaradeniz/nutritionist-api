import express, { Request, Response, NextFunction } from "express";
import { RoleManager } from "../../bussiness/role-process/roleManager";

const router: express.Router = express.Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const roles = await new RoleManager().getAllRoles();
  res.send(roles);
});

export default router;
