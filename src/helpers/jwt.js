"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("config"));
const secretKey = config_1.default.get("jwtPrivateKey");
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.userName,
        email: user.email,
        role: user.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "1h" });
    return token;
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
