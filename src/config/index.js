"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: "1h",
    },
    cors: {
        allowedMethods: ((_a = process.env.ALLOWED_METHODS) === null || _a === void 0 ? void 0 : _a.split(",")) || [],
        allowedOrigin: process.env.ALLOWED_ORIGIN || "*",
        allowedHeaders: ((_b = process.env.ALLOWED_HEADERS) === null || _b === void 0 ? void 0 : _b.split(",")) || [],
    },
};
