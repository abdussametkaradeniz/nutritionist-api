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
exports.LoginManager = void 0;
const loginDbManager_1 = require("../../database/loginDbManager");
const exception_1 = require("../../domain/exception");
const jwt_1 = require("../../helpers/jwt");
const passwordHash_1 = require("../../helpers/passwordHash");
class LoginManager {
    constructor(request) {
        this.request = request;
        this.loginDbManager = new loginDbManager_1.LoginDbManager();
    }
    findUniqueUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.loginDbManager.findUniqueUser(this.request);
            if (!user) {
                throw new exception_1.NotFound("User not found");
            }
            const isPasswordValid = yield (0, passwordHash_1.comparePassword)(this.request.password, user.passwordHash);
            if (!isPasswordValid) {
                throw new exception_1.InvalidParameter("Invalid credentials");
            }
            const jwt = (0, jwt_1.generateToken)(user);
            return { user, token: jwt };
        });
    }
}
exports.LoginManager = LoginManager;
