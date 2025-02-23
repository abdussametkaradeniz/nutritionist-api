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
exports.authenticateToken = void 0;
exports.auth = auth;
const forbidden_1 = require("../domain/exception/forbidden");
const unauthorized_1 = require("../domain/exception/unauthorized");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("../utils/appError");
const jwt_1 = require("src/helpers/jwt");
// Kaldır veya yorum satırına al
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         roles: UserRole;
//         permissions: string[];
//       };
//     }
//   }
// }
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
const isAuthorized = (userRoles, requiredRoles, userPermissions = [], requiredPermissions) => {
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
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            throw new unauthorized_1.Unauthorized("No token provided");
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new appError_1.AppError("Invalid token", 401));
        }
        else {
            next(error);
        }
    }
});
exports.authenticateToken = authenticateToken;
