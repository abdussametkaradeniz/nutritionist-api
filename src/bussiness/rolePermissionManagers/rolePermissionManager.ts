import { RolePermissionDbManager } from "./../../database/roleDbManager";
import { RolePermissionsType } from "../../types/rolePermissions/rolePermissionsType";
import { BusinessException, NotFound } from "../../domain/exception";

export class RolePermissionManager {
  request: RolePermissionsType;
  rolePermissionDbManager: RolePermissionDbManager;

  constructor(request: RolePermissionsType) {
    this.request = request;
    this.rolePermissionDbManager = new RolePermissionDbManager();
  }

  async createPermission(): Promise<{
    name: string;
    description: string;
    id: number;
  }> {
    const { permission } = this.request;
    const { name } = permission;

    const isPermissionUnique =
      await this.rolePermissionDbManager.isPermissionUnique(name);

    if (isPermissionUnique) {
      throw new BusinessException("Permission was found", 400);
    }

    const createdPermission = await this.rolePermissionDbManager.addPermission(
      this.request
    );

    if (!createdPermission) {
      throw new BusinessException("permission can not be created", 400);
    }
    return createdPermission;
  }

  async updatePermissionRole(): Promise<{
    name: string;
    id: number;
    description: string;
  }> {
    const { permission, roles } = this.request;
    const { name, permissionId } = permission;

    const roleIds = roles.map((role) => role.roleId);
    const isPermissionConnectedRole =
      await this.rolePermissionDbManager.isPermissionConnectedRole(
        roleIds,
        permissionId!
      );

    if (isPermissionConnectedRole) {
      throw new BusinessException(
        "This permission already connected with role",
        400
      );
    }

    const updatedRolePermissions =
      await this.rolePermissionDbManager.updateRolePermission(
        permission.permissionId!,
        roleIds
      );

    return updatedRolePermissions;
  }

  //permission silinebilir

  //bütün permissionlar dönmeli
  async getAllPermissionsWithRole(): Promise<any> {
    const { page, pageSize } = this.request;
    const allPermissionsWithRoles =
      await this.rolePermissionDbManager.getAllPermissionsWithRoles(
        page!,
        pageSize!
      );
    if (!allPermissionsWithRoles) {
      throw new NotFound("There is no role");
    }
    return allPermissionsWithRoles;
  }
}
