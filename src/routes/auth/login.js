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
const express_1 = __importDefault(require("express"));
const loginValidator_1 = require("../../validations/auth/loginValidator");
const requestValidator_1 = require("../../middleware/requestValidator");
const loginManager_1 = require("../../bussiness/auth/loginManager");
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const router = express_1.default.Router();
router.post("/", (0, requestValidator_1.requestValidator)(loginValidator_1.loginSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const loginManager = new loginManager_1.LoginManager(request);
        const result = yield loginManager.findUniqueUser();
        res.cookie("authToken", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000,
        });
        console.log(result);
        (0, responseHandler_1.sendSuccess)(res, { user: result.user, token: result.token }, "Login successful");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound || error instanceof exception_1.InvalidParameter) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
