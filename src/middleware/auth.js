"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const forbidden_1 = require("../domain/exception/forbidden");
const unauthorized_1 = require("../domain/exception/unauthorized");
function auth(requiredRoles, requiredPermissions) {
    return (req, res, next) => {
        if (!req.user || req.user.roles.length === 0) {
            throw new unauthorized_1.Unauthorized("User is not found");
        }
        if (!isAuthorized(req.user.roles, requiredRoles, req.user.permissions, requiredPermissions)) {
            throw new forbidden_1.Forbidden("Invalid user/corporate role or insufficient permissions");
        }
        next();
    };
}
const isAuthorized = (userRoles = [], requiredRoles, userPermissions = [], requiredPermissions) => {
    if (requiredRoles &&
        !requiredRoles.some((role) => userRoles.includes(role))) {
        return false;
    }
    if (requiredPermissions &&
        !requiredPermissions.every((permission) => userPermissions.includes(permission))) {
        return false;
    }
    return true;
};
