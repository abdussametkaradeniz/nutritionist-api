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
const express_1 = __importDefault(require("express"));
const requestValidator_1 = require("../../middleware/requestValidator");
const permissionValidator_1 = require("../../validations/permission/permissionValidator");
const rolePermissionManager_1 = require("../../bussiness/rolePermissionManagers/rolePermissionManager");
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const router = express_1.default.Router();
router.post("/add-permission", (0, requestValidator_1.requestValidator)(permissionValidator_1.permissionCreateSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(request);
        const result = yield rolePermissionManager.createPermission();
        (0, responseHandler_1.sendSuccess)(res, result, "permission created successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.post("/update-permission", (0, requestValidator_1.requestValidator)(permissionValidator_1.permissionUpdateSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(request);
        const result = yield rolePermissionManager.updatePermissionRole();
        (0, responseHandler_1.sendSuccess)(res, result, "permission updated successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const request = {
        roles: [],
        permission: { permissionId: 0, name: "", description: "" },
        page,
        pageSize,
    };
    try {
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(request);
        const result = yield rolePermissionManager.getAllPermissionsWithRole();
        (0, responseHandler_1.sendSuccess)(res, result, "process executed succesfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound || error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/get-all-roles", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestObj = {
            permission: {
                name: "",
                description: "",
            },
            roles: [],
        };
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(requestObj);
        const roles = yield rolePermissionManager.getAllRoles();
        (0, responseHandler_1.sendSuccess)(res, roles, "Roles can be listed");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/get-connected-permissions", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { role } = req.query;
    const roles = role;
    const rolename = roles;
    console.log(rolename);
    try {
        const requestObj = {
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
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(requestObj);
        const roles = yield rolePermissionManager.getPermissionsWithConnectedRole();
        (0, responseHandler_1.sendSuccess)(res, roles, "Roles can be listed");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/search-with-criteria", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, selectedPermission, page, pageSize } = req.query;
    try {
        const roles = role;
        const rolename = roles;
        const requestObj = {
            permission: {
                name: selectedPermission ? selectedPermission : "",
                description: "",
            },
            roles: [
                {
                    roleId: 0,
                    roleName: rolename !== null && rolename !== void 0 ? rolename : "",
                },
            ],
            page: parseInt(page) || 1,
            pageSize: parseInt(pageSize) || 10,
        };
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(requestObj);
        const results = yield rolePermissionManager.searchWithCriteria();
        (0, responseHandler_1.sendSuccess)(res, results, "All roles and permissions are listed based on criteria.");
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/delete-permission", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { permissionId } = req.body;
    try {
        const requestObj = {
            permission: {
                permissionId: permissionId,
                name: "",
                description: "",
            },
        };
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager(requestObj);
        const result = yield rolePermissionManager.deletePermission();
        (0, responseHandler_1.sendSuccess)(res, result, "permission deleted successfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.patch("/update-user-role", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, newRoleId } = req.body;
    try {
        const rolePermissionManager = new rolePermissionManager_1.RolePermissionManager({});
        const result = yield rolePermissionManager.updateUserRole(userId, newRoleId);
        (0, responseHandler_1.sendSuccess)(res, result, "User role updated successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
