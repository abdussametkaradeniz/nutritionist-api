import { GeneralRoleType } from "./../../types/rolePermissions/generalRoleType";
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
import { RoleTypes } from "../../types/rolePermissions/roleEnums";

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

router.get(
  "/get-all-roles",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestObj: RolePermissionsType = {
        permission: {
          name: "",
          description: "",
        },
        roles: [],
      };

      const rolePermissionManager = new RolePermissionManager(requestObj);
      const roles = await rolePermissionManager.getAllRoles();
      sendSuccess(res, roles, "Roles can be listed");
    } catch (error: unknown) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.get(
  "/get-connected-permissions",
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.query;
    const roles = role as unknown as GeneralRoleType;
    const rolename = roles as unknown as RoleTypes;
    console.log(rolename);
    try {
      const requestObj: RolePermissionsType = {
        permission: {
          name: "",
          description: "",
        },
        roles: [
          {
            roleId: 0,
            roleName: rolename,
          },
        ],
      };
      const rolePermissionManager = new RolePermissionManager(requestObj);
      const roles =
        await rolePermissionManager.getPermissionsWithConnectedRole();
      sendSuccess(res, roles, "Roles can be listed");
    } catch (error: unknown) {
      if (error instanceof BusinessException) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

router.get(
  "/search-with-criteria",
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, selectedPermission, page, pageSize } = req.query;
    try {
      const roles = role as unknown as GeneralRoleType;
      const rolename = roles as unknown as RoleTypes;

      const requestObj: RolePermissionsType = {
        permission: {
          name: selectedPermission ? (selectedPermission as string) : "",
          description: "",
        },
        roles: [
          {
            roleId: 0,
            roleName: rolename ?? "",
          },
        ],
        page: parseInt(page as string) || 1,
        pageSize: parseInt(pageSize as string) || 10,
      };

      const rolePermissionManager = new RolePermissionManager(requestObj);
      const results = await rolePermissionManager.searchWithCriteria();
      sendSuccess(
        res,
        results,
        "All roles and permissions are listed based on criteria."
      );
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.patch(
  "/delete-permission",
  async (req: Request, res: Response, next: NextFunction) => {
    const { permissionId } = req.body;

    try {
      const requestObj = {
        permission: {
          permissionId: permissionId,
          name: "",
          description: "",
        },
      };

      const rolePermissionManager = new RolePermissionManager(
        requestObj as RolePermissionsType
      );
      const result = await rolePermissionManager.deletePermission();
      sendSuccess(res, result, "permission deleted successfully");
    } catch (error) {
      if (error instanceof NotFound) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
