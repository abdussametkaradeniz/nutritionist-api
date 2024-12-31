"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// logger.js
const winston_1 = __importDefault(require("winston"));
const logger = winston_1.default.createLogger({
    level: "error",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({ filename: "error.log" }),
        new winston_1.default.transports.Console(),
    ],
});
exports.default = logger;
