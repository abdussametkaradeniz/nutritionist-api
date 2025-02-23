"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("../utils/appError");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../helpers/logger"));
const Sentry = __importStar(require("@sentry/node"));
const errorMiddleware = (err, req, res, next) => {
    var _a, _b;
    // Sentry'ye hatayı gönder
    Sentry.captureException(err, {
        user: {
            id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        },
        extra: {
            path: req.path,
            method: req.method,
            query: req.query,
            body: req.body,
        },
    });
    // Detaylı loglama
    logger_1.default.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId,
        timestamp: new Date().toISOString(),
        headers: req.headers,
        query: req.query,
        body: req.body,
    });
    // AppError handling
    if (err instanceof appError_1.AppError) {
        return res.status(err.statusCode).json(Object.assign({ success: false, message: err.message, code: err.code }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
    }
    // Zod validation errors
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json(Object.assign({ success: false, message: "Validation error", errors: err.errors }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
    }
    // Prisma errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A record with this data already exists",
            });
        }
        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Record not found",
            });
        }
    }
    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }
    // Default error response
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json(Object.assign({ success: false, message: process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.default = errorMiddleware;
