"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.hasRole = void 0;
const appError_1 = require("../utils/appError");
// Rol kontrolü için middleware
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError("Unauthorized", 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new appError_1.AppError("Forbidden: Insufficient role", 403));
        }
        next();
    };
};
exports.hasRole = hasRole;
// İzin kontrolü için middleware
const hasPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new appError_1.AppError("Unauthorized", 401));
        }
        const hasRequiredPermissions = permissions.every((permission) => { var _a; return (_a = req.user) === null || _a === void 0 ? void 0 : _a.permissions.includes(permission); });
        if (!hasRequiredPermissions) {
            return next(new appError_1.AppError("Forbidden: Insufficient permissions", 403));
        }
        next();
    };
};
exports.hasPermission = hasPermission;
