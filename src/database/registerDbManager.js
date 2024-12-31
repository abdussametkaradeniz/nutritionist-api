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
exports.RegisterDbManager = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class RegisterDbManager {
    constructor() {
        this.findEmail = (email) => __awaiter(this, void 0, void 0, function* () {
            const user = client_1.default.user.findUnique({ where: { email: email } });
            return user;
        });
        this.findUsername = (username) => __awaiter(this, void 0, void 0, function* () {
            const user = client_1.default.user.findUnique({ where: { username: username } });
            return user;
        });
        this.findPhonenumber = (phoneNumber) => __awaiter(this, void 0, void 0, function* () {
            const user = client_1.default.user.findUnique({
                where: { phoneNumber: phoneNumber },
            });
            return user;
        });
        this.create = (registerData) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            console.log(registerData, "register data");
            const user = yield client_1.default.user.create({
                data: {
                    username: registerData.userName,
                    email: registerData.email,
                    passwordHash: registerData.password,
                    roles: {
                        connect: [{ name: (_a = registerData.role) !== null && _a !== void 0 ? _a : "BASICUSER" }],
                    },
                    phoneNumber: (_b = registerData.phoneNumber) !== null && _b !== void 0 ? _b : "",
                    profile: {
                        create: {
                            firstName: registerData.firstName,
                            lastName: (_c = registerData.lastName) !== null && _c !== void 0 ? _c : "",
                            secondName: (_d = registerData.secondName) !== null && _d !== void 0 ? _d : "",
                            age: (_e = registerData.age) !== null && _e !== void 0 ? _e : 0,
                            weight: (_f = registerData.weight) !== null && _f !== void 0 ? _f : 0,
                            goals: (_g = registerData.goals) !== null && _g !== void 0 ? _g : "GAINMUSCLES",
                            photoUrl: (_h = registerData.photoUrl) !== null && _h !== void 0 ? _h : "",
                            isProfileCompleted: false,
                        },
                    },
                },
            });
            return user;
        });
    }
}
exports.RegisterDbManager = RegisterDbManager;
