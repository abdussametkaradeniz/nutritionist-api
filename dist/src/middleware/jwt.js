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
exports.jwt = jwt;
const jwt_1 = require("../helpers/jwt");
const invalid_parameter_1 = require("../domain/exception/invalid-parameter");
function jwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.header("Authorization");
        if (!token) {
            return next(new invalid_parameter_1.InvalidParameter("Token is missing"));
        }
        if (typeof token !== "string") {
            return next(new invalid_parameter_1.InvalidParameter("Invalid token format"));
        }
        if (token && typeof token !== "string") {
            return next(new invalid_parameter_1.InvalidParameter("Invalid token format"));
        }
        try {
            const verifiedUser = yield (0, jwt_1.verifyToken)(token);
            if (!verifiedUser) {
                console.error("Token verification failed: User is null");
                return next(new invalid_parameter_1.InvalidParameter("Invalid token"));
            }
            req.user = {
                userId: verifiedUser.userId,
                email: verifiedUser.email,
                role: verifiedUser.role,
                permissions: verifiedUser.permissions ? verifiedUser.permissions : [],
            };
            console.log("req.user", req.user);
            console.log("verifiedUser", verifiedUser);
            next();
        }
        catch (err) {
            console.error("Error during token verification:", err);
            next(err);
        }
    });
}
