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
exports.RegisterManager = void 0;
const registerDbManager_1 = require("../../database/registerDbManager");
const exception_1 = require("../../domain/exception");
const passwordHash_1 = require("../../helpers/passwordHash");
class RegisterManager {
    constructor(request) {
        this.request = request;
        this.registerDbManager = new registerDbManager_1.RegisterDbManager();
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            const findEmail = yield this.registerDbManager.findEmail(this.request.email);
            if (findEmail) {
                throw new exception_1.BusinessException("Email already using", 400);
            }
            if (this.request.phoneNumber) {
                const findPhoneNumber = yield this.registerDbManager.findPhonenumber(this.request.phoneNumber);
                if (findPhoneNumber) {
                    throw new exception_1.BusinessException("phone number already using", 400);
                }
            }
            const findUsername = yield this.registerDbManager.findUsername(this.request.userName);
            if (findUsername) {
                throw new exception_1.BusinessException("user name already using", 400);
            }
            this.request.password = yield (0, passwordHash_1.hashPassword)(this.request.password);
            const result = yield this.registerDbManager.create(this.request);
            return result;
        });
    }
    ;
}
exports.RegisterManager = RegisterManager;
