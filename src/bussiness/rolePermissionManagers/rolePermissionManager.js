"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionManager = void 0;
const rolePermissionDbManager_1 = require("../../database/rolePermissionDbManager");
const exception_1 = require("../../domain/exception");
class RolePermissionManager {
    constructor(request) {
        this.request = request;
        this.rolePermissionDbManager = new rolePermissionDbManager_1.RolePermissionDbManager();
    }
    createPermission() {
        return __awaiter(this, void 0, void 0, function* () {
            const { permission } = this.request;
            const { name } = permission;
            const isPermissionUnique = yield this.rolePermissionDbManager.isPermissionUnique(name);
            if (isPermissionUnique) {
                throw new exception_1.BusinessException("Permission was found", 400);
            }
            const createdPermission = yield this.rolePermissionDbManager.addPermission(this.request);
            if (!createdPermission) {
                throw new exception_1.BusinessException("permission can not be created", 400);
            }
            return createdPermission;
        });
    }
    updatePermissionRole() {
        return __awaiter(this, void 0, void 0, function* () {
            const { permission, roles } = this.request;
            const { name, permissionId } = permission;
            const roleIds = roles.map((role) => role.roleId);
            const isPermissionConnectedRole = yield this.rolePermissionDbManager.isPermissionConnectedRole(roleIds, permissionId);
            if (isPermissionConnectedRole) {
                throw new exception_1.BusinessException("This permission already connected with role", 400);
            }
            const updatedRolePermissions = yield this.rolePermissionDbManager.updateRolePermission(permission, roleIds);
            return updatedRolePermissions;
        });
    }
    //permission silinebilir
    //bütün permissionlar dönmeli
    getAllPermissionsWithRole() {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize } = this.request;
            const allPermissionsWithRoles = yield this.rolePermissionDbManager.getAllPermissionsWithRoles(page, pageSize);
            if (!allPermissionsWithRoles) {
                throw new exception_1.NotFound("There is no role");
            }
            return allPermissionsWithRoles;
        });
    }
    getAllRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const allRoles = yield this.rolePermissionDbManager.getAllRoles();
            if (!allRoles) {
                throw new exception_1.BusinessException("Something went wrong!", 401);
            }
            return allRoles;
        });
    }
    getPermissionsWithConnectedRole() {
        return __awaiter(this, void 0, void 0, function* () {
            const roleName = this.request.roles[0].roleName;
            const permissions = yield this.rolePermissionDbManager.getPermissionsWithConnectedRole(roleName);
            if (!permissions) {
                throw new exception_1.BusinessException("Something went wrong", 400);
            }
            return permissions;
        });
    }
    searchWithCriteria() {
        return __awaiter(this, void 0, void 0, function* () {
            const roleName = this.request.roles[0].roleName;
            const permissionName = this.request.permission.name;
            const searchResults = yield this.rolePermissionDbManager.searchWithCriteria(roleName, permissionName, this.request.page, this.request.pageSize);
            return searchResults;
        });
    }
    deletePermission() {
        return __awaiter(this, void 0, void 0, function* () {
            const permissionId = this.request.permission.permissionId;
            const result = yield this.rolePermissionDbManager.deletePermission(permissionId);
            return result;
        });
    }
    updateUserRole(userId, newRoleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUserRole = yield this.rolePermissionDbManager.updateUserRole(userId, newRoleId);
            if (!updatedUserRole) {
                throw new exception_1.BusinessException("Failed to update user role", 400);
            }
            return updatedUserRole;
        });
    }
}
exports.RolePermissionManager = RolePermissionManager;
