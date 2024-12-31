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
exports.LoginDbManager = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
class LoginDbManager {
    constructor() {
        this.findUniqueUser = (loginData) => __awaiter(this, void 0, void 0, function* () {
            const { identifier, password } = loginData;
            let user;
            if (identifier.includes("@")) {
                user = yield client_1.default.user.findUnique({
                    where: { email: loginData.identifier },
                    include: {
                        profile: true,
                        mealPlans: true,
                        appointmentsAsUser: true,
                        appointmentsAsDietitian: true,
                        performances: true,
                        roles: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
            else if (/^\d+$/.test(identifier)) {
                user = yield client_1.default.user.findUnique({
                    where: { phoneNumber: loginData.identifier },
                    include: {
                        profile: true,
                        mealPlans: true,
                        appointmentsAsUser: true,
                        appointmentsAsDietitian: true,
                        performances: true,
                        roles: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
            else {
                user = yield client_1.default.user.findUnique({
                    where: { username: loginData.identifier },
                    include: {
                        profile: true,
                        mealPlans: true,
                        appointmentsAsUser: true,
                        appointmentsAsDietitian: true,
                        performances: true,
                        roles: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
            return user;
        });
    }
}
exports.LoginDbManager = LoginDbManager;
