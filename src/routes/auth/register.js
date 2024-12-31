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
const registerValidator_1 = require("../../validations/auth/registerValidator");
const requestValidator_1 = require("../../middleware/requestValidator");
const registerManager_1 = require("../../bussiness/auth/registerManager");
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const router = express_1.default.Router();
router.post("/", (0, requestValidator_1.requestValidator)(registerValidator_1.registerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const registerManager = new registerManager_1.RegisterManager(request);
        const result = yield registerManager.create();
        (0, responseHandler_1.sendSuccess)(res, { user: result }, "Register Successful");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound
            || error instanceof exception_1.InvalidParameter
            || error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(new Error("An unexpected error occurred"));
        }
    }
}));
exports.default = router;
