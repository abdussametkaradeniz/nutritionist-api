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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissionDbManager = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const exception_1 = require("../domain/exception");
class RolePermissionDbManager {
    constructor() {
        this.isPermissionUnique = (name) => __awaiter(this, void 0, void 0, function* () {
            const isPermissionFind = yield client_1.default.permission.findUnique({
                where: { name: name },
            });
            return isPermissionFind;
        });
        this.addPermission = (request) => __awaiter(this, void 0, void 0, function* () {
            const createdPermission = yield client_1.default.permission.create({
                data: {
                    name: request.permission.name,
                    description: request.permission.description,
                    recordStatus: "A",
                    lastUpdateDate: new Date(),
                    lastUpdatingUser: "BATCH",
                    roles: {
                        connect: request.roles.map((role) => ({ name: role.roleName })),
                    },
                },
            });
            return createdPermission;
        });
        this.isPermissionConnectedRole = (roleIds, permissionId) => __awaiter(this, void 0, void 0, function* () {
            const existingRelation = yield client_1.default.rolePermissions.findFirst({
                where: {
                    permissionId: permissionId,
                    roleId: { in: roleIds },
                },
            });
            return existingRelation;
        });
        this.updateRolePermission = (permission, roleIdList) => __awaiter(this, void 0, void 0, function* () {
            const currentRoles = yield client_1.default.permission.findUnique({
                where: { id: permission === null || permission === void 0 ? void 0 : permission.permissionId },
                include: { roles: true },
            });
            const currentRoleIds = new Set(currentRoles.roles.map((role) => role.id));
            const newRoleIds = new Set(roleIdList);
            const rolesToAdd = roleIdList.filter((id) => !currentRoleIds.has(id));
            const rolesToRemove = currentRoles.roles.filter((role) => !newRoleIds.has(role.id));
            const updatedPermission = yield client_1.default.permission.update({
                where: { id: permission === null || permission === void 0 ? void 0 : permission.permissionId },
                data: {
                    description: permission === null || permission === void 0 ? void 0 : permission.description,
                    name: permission === null || permission === void 0 ? void 0 : permission.name,
                    roles: {
                        disconnect: rolesToRemove.map((role) => ({ id: role.id })),
                        connect: rolesToAdd.map((id) => ({ id })),
                    },
                },
            });
            return updatedPermission;
        });
        this.getAllPermissionsWithRoles = (page, pageSize) => __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const take = pageSize;
            const permissions = yield client_1.default.permission.findMany({
                skip,
                take,
                include: {
                    roles: true,
                },
            });
            return permissions;
        });
        this.getAllRoles = () => __awaiter(this, void 0, void 0, function* () {
            const roles = yield client_1.default.role.findMany();
            return roles;
        });
        this.getPermissionsWithConnectedRole = (role) => __awaiter(this, void 0, void 0, function* () {
            const permissions = yield client_1.default.role.findUnique({
                where: { name: role },
                include: {
                    permissions: true,
                },
            });
            return permissions;
        });
        this.searchWithCriteria = (role, permission, page, pageSize) => __awaiter(this, void 0, void 0, function* () {
            let searchResult;
            const skip = (page - 1) * pageSize;
            const take = pageSize;
            console.log(role, permission, page, pageSize);
            if (role && permission) {
                searchResult = yield client_1.default.role.findMany({
                    where: {
                        name: role,
                        permissions: {
                            some: {
                                name: permission,
                            },
                        },
                    },
                    include: {
                        permissions: true,
                    },
                });
            }
            else if (role && !permission) {
                searchResult = yield client_1.default.role.findMany({
                    where: {
                        name: role,
                    },
                    include: {
                        permissions: true,
                    },
                });
            }
            else if (!role && permission) {
                searchResult = yield client_1.default.permission.findMany({
                    include: {
                        roles: true,
                    },
                    where: {
                        name: permission,
                    },
                });
            }
            else {
                searchResult = yield client_1.default.role.findMany({
                    skip,
                    take,
                    include: {
                        permissions: true,
                    },
                });
            }
            return searchResult;
        });
        this.deletePermission = (permissionId) => __awaiter(this, void 0, void 0, function* () {
            const currentPermission = yield client_1.default.permission.findUnique({
                where: { id: permissionId },
            });
            if (!currentPermission) {
                throw new exception_1.NotFound("permission id not found");
            }
            const deletedPermission = yield client_1.default.permission.update({
                where: { id: permissionId },
                data: {
                    recordStatus: "P",
                },
            });
            return deletedPermission;
        });
    }
    updateUserRole(userId, newRoleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield client_1.default.user.update({
                where: { id: userId },
                data: {
                    roles: {
                        set: [{ id: newRoleId }],
                    },
                },
            });
            return updatedUser;
        });
    }
}
exports.RolePermissionDbManager = RolePermissionDbManager;
