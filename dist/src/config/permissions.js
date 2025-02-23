"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolePermissions = void 0;
const role_model_1 = require("../models/role.model");
exports.rolePermissions = {
    [role_model_1.Role.USER]: [
        role_model_1.Permission.READ_PROFILE,
        role_model_1.Permission.UPDATE_PROFILE,
        role_model_1.Permission.CREATE_APPOINTMENT,
    ],
    [role_model_1.Role.DIETITIAN]: [
        role_model_1.Permission.READ_PROFILE,
        role_model_1.Permission.UPDATE_PROFILE,
        role_model_1.Permission.UPDATE_APPOINTMENT,
        role_model_1.Permission.DELETE_APPOINTMENT,
    ],
    [role_model_1.Role.ADMIN]: Object.values(role_model_1.Permission),
};
