"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionUpdateSchema = exports.permissionCreateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const role_model_1 = require("src/models/role.model");
exports.permissionCreateSchema = joi_1.default.object({
    permission: joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        recordStatus: joi_1.default.string().default("A"),
        lastUpdatingUser: joi_1.default.string().default("admin"),
    }),
    roles: joi_1.default.array()
        .items(joi_1.default.object({
        roleId: joi_1.default.number().integer().positive().required(),
        roleName: joi_1.default.string()
            .valid("ADMIN", "DIETITIAN", "USER", "PREMIUMUSER", "BASICUSER")
            .required(),
        recordStatus: joi_1.default.string().default("A"),
        lastUpdatingUser: joi_1.default.string().default("admin"),
    }))
        .min(1)
        .required(),
});
const roleNames = Object.values(role_model_1.Role);
exports.permissionUpdateSchema = joi_1.default.object({
    permission: joi_1.default.object({
        permissionId: joi_1.default.number().required(),
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
    }),
    roles: joi_1.default.array()
        .items(joi_1.default.object({
        roleId: joi_1.default.number().required(),
        roleName: joi_1.default.string().valid(...roleNames),
    }))
        .min(1),
});
