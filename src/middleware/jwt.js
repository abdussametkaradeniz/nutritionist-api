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
const UserRole_1 = require("../types/user/UserRole");
function jwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.cookies["token"] || req.header("x-auth-token");
        const defaultMember = {
            age: 0,
            email: "",
            firstName: "",
            password: "",
            phoneNumber: "",
            recordStatus: "A",
            role: UserRole_1.UserRole.USER,
            roleId: 0,
            secondaryName: "",
            lastName: "",
            userName: "",
            permissions: [],
        };
        if (token && typeof token !== "string") {
            return next(new invalid_parameter_1.InvalidParameter("Invalid token format"));
        }
        try {
            let user = defaultMember;
            if (token && token !== "0" && token !== "null" && token !== "undefined") {
                const verifiedUser = yield (0, jwt_1.verifyToken)(token);
                if (verifiedUser !== null) {
                    user = verifiedUser;
                }
            }
            req.user = {
                roles: Array.isArray(user.role) ? user.role : [user.role],
                permissions: user.permissions.map((permission) => permission.toString()),
            };
            next();
        }
        catch (err) {
            next(err);
        }
    });
}
