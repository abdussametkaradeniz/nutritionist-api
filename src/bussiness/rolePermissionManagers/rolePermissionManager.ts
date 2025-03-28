import { RolePermissionDbManager } from "../../database/rolePermissionDbManager";
import { RolePermissionsType } from "../../types/rolePermissions/rolePermissionsType";
import { BusinessException, NotFound } from "../../domain/exception";

export class RolePermissionManager {
  request?: RolePermissionsType;
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
    const { permission } = this.request!;
    const { name } = permission;
    const isPermissionUnique =
      await this.rolePermissionDbManager.isPermissionUnique(name);

    if (isPermissionUnique) {
      throw new BusinessException("Permission was found", 400);
    }

    const createdPermission = await this.rolePermissionDbManager.addPermission(
      this.request!
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
    const { permission, roles } = this.request!;
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
        permission,
        roleIds
      );

    return updatedRolePermissions;
  }

  //permission silinebilir

  //bütün permissionlar dönmeli
  async getAllPermissionsWithRole(): Promise<any> {
    const { page, pageSize } = this.request!;
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

  async getAllRoles(): Promise<any> {
    const allRoles = await this.rolePermissionDbManager.getAllRoles();

    if (!allRoles) {
      throw new BusinessException("Something went wrong!", 401);
    }
    return allRoles;
  }

  async getPermissionsWithConnectedRole(): Promise<any> {
    const roleName = this.request!.roles[0].roleName;
    const permissions =
      await this.rolePermissionDbManager.getPermissionsWithConnectedRole(
        roleName
      );

    if (!permissions) {
      throw new BusinessException("Something went wrong", 400);
    }
    return permissions;
  }

  async searchWithCriteria(): Promise<any> {
    const roleName = this.request!.roles[0].roleName;
    const permissionName = this.request!.permission.name;

    const searchResults = await this.rolePermissionDbManager.searchWithCriteria(
      roleName,
      permissionName,
      this.request!.page!,
      this.request!.pageSize!
    );
    return searchResults;
  }

  async deletePermission(): Promise<any> {
    const permissionId = this.request!.permission!.permissionId;

    const result = await this.rolePermissionDbManager.deletePermission(
      permissionId!
    );
    return result;
  }

  async updateUserRole(userId: number, newRoleId: number): Promise<any> {
    const updatedUserRole = await this.rolePermissionDbManager.updateUserRole(
      userId,
      newRoleId
    );
    if (!updatedUserRole) {
      throw new BusinessException("Failed to update user role", 400);
    }
    return updatedUserRole;
  }
}
