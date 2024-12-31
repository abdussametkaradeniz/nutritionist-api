"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    userName: joi_1.default.string().optional(),
    email: joi_1.default.string().optional(),
    phoneNumber: joi_1.default.string().optional(),
    password: joi_1.default.string().required(),
    age: joi_1.default.number().optional().default(0),
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    secondName: joi_1.default.string().optional().default(""),
    role: joi_1.default.string().optional(),
    weight: joi_1.default.number().optional(),
    height: joi_1.default.number().optional(),
    goals: joi_1.default.string().optional(),
    photoUrl: joi_1.default.string().optional().default(" ")
});
