"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../helpers/logger"));
const errorMiddleware = (err, req, res, next) => {
    const errorType = err.constructor.name;
    logger_1.default.error(`Error: ${err.message}`, {
        errorType,
        method: req.method,
        url: req.url,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
    res.status(err.status || 500).json(Object.assign({ isError: true, errorType, message: err.message || "Internal Server Error", status: err.status || 500 }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.default = errorMiddleware;
