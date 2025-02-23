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
exports.AuthService = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const exception_1 = require("../domain/exception");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    register(registerData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            // Check if email exists
            const existingEmail = yield client_1.default.user.findUnique({
                where: { email: registerData.email },
            });
            if (existingEmail) {
                throw new exception_1.BusinessException("Email already exists", 400);
            }
            // Check if username exists
            const existingUsername = yield client_1.default.user.findUnique({
                where: { username: registerData.username },
            });
            if (existingUsername) {
                throw new exception_1.BusinessException("Username already exists", 400);
            }
            // Hash password
            const hashedPassword = yield bcrypt_1.default.hash(registerData.password, 10);
            // Create user with required and optional fields
            const user = yield client_1.default.user.create({
                data: {
                    // Required fields
                    email: registerData.email,
                    username: registerData.username,
                    passwordHash: hashedPassword,
                    // Optional fields with defaults
                    phoneNumber: (_a = registerData.phoneNumber) !== null && _a !== void 0 ? _a : null,
                    fullName: (_b = registerData.fullName) !== null && _b !== void 0 ? _b : null,
                    birthDate: registerData.birthDate
                        ? new Date(registerData.birthDate)
                        : null,
                    gender: (_c = registerData.gender) !== null && _c !== void 0 ? _c : null,
                    height: (_d = registerData.height) !== null && _d !== void 0 ? _d : null,
                    weight: (_e = registerData.weight) !== null && _e !== void 0 ? _e : null,
                    address: (_f = registerData.address) !== null && _f !== void 0 ? _f : null,
                    avatarUrl: (_g = registerData.avatarUrl) !== null && _g !== void 0 ? _g : null,
                    emailVerified: false,
                    role: {
                        connect: { name: "USER" },
                    },
                    permissions: [],
                    twoFactorEnabled: false,
                    backupCodes: [],
                    // Optional relations
                    preferences: {
                        create: {
                            language: "tr",
                            timezone: "Europe/Istanbul",
                            theme: "SYSTEM",
                            emailNotifications: true,
                            pushNotifications: true,
                            smsNotifications: false,
                        },
                    },
                    profile: registerData.profile
                        ? {
                            create: {
                                firstName: (_h = registerData.profile.firstName) !== null && _h !== void 0 ? _h : null,
                                lastName: (_j = registerData.profile.lastName) !== null && _j !== void 0 ? _j : null,
                                secondName: (_k = registerData.profile.secondName) !== null && _k !== void 0 ? _k : null,
                                age: (_l = registerData.profile.age) !== null && _l !== void 0 ? _l : null,
                                weight: (_m = registerData.profile.weight) !== null && _m !== void 0 ? _m : null,
                                isProfileCompleted: false,
                                photoUrl: (_o = registerData.profile.photoUrl) !== null && _o !== void 0 ? _o : null,
                            },
                        }
                        : undefined,
                },
            });
            return user;
        });
    }
    static generateTokens(user) {
        const payload = {
            userId: user.userId,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
        return { accessToken, refreshToken };
    }
    static login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield client_1.default.user.findUnique({
                where: { email },
                include: {
                    role: true,
                },
            });
            if (!user) {
                throw new exception_1.BusinessException("Invalid credentials", 401);
            }
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role.name,
            });
            return Object.assign(Object.assign({}, tokens), { user: {
                    id: user.id,
                    email: user.email,
                    role: user.role.name,
                } });
        });
    }
}
exports.AuthService = AuthService;
