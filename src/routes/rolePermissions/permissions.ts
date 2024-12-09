import express, { NextFunction, Request, Response } from "express";
import { requestValidator } from "../../middleware/requestValidator";
import {
  permissionCreateSchema,
  permissionUpdateSchema,
} from "../../validations/permission/permissionValidator";
import { RolePermissionsType } from "../../types/rolePermissions/rolePermissionsType";
import { RolePermissionManager } from "../../bussiness/rolePermissionManagers/rolePermissionManager";
import { sendSuccess } from "../../helpers/responseHandler";
import { BusinessException, NotFound } from "../../domain/exception";

const router: express.Router = express.Router();

router.post(
  "/add-permission",
  requestValidator(permissionCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as RolePermissionsType;
    try {
      const rolePermissionManager = new RolePermissionManager(request);
      const result = await rolePermissionManager.createPermission();
      sendSuccess(res, result, "permission created successfully");
    } catch (error) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.post(
  "/update-permission",
  requestValidator(permissionUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as RolePermissionsType;
    try {
      const rolePermissionManager = new RolePermissionManager(request);
      const result = await rolePermissionManager.updatePermissionRole();
      sendSuccess(res, result, "permission updated successfully");
    } catch (error) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const request: RolePermissionsType = {
    roles: [],
    permission: { permissionId: 0, name: "", description: "" },
    page,
    pageSize,
  };

  try {
    const rolePermissionManager = new RolePermissionManager(request);
    const result = await rolePermissionManager.getAllPermissionsWithRole();
    sendSuccess(res, result, "process executed succesfully");
  } catch (error) {
    if (error instanceof NotFound || error instanceof BusinessException) {
      next(error);
    } else {
      next(error);
    }
  }
});

export default router;
