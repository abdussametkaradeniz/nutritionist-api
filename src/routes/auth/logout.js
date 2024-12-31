"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const responseHandler_1 = require("../../helpers/responseHandler");
const router = express_1.default.Router();
router.post("/", (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    (0, responseHandler_1.sendSuccess)(res, null, "Logout successful");
});
exports.default = router;
