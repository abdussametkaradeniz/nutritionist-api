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
const userProcessManager_1 = require("../../bussiness/users/userProcessManager");
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const auth_1 = require("../../middleware/auth");
const UserRole_1 = require("../../types/user/UserRole");
const router = express_1.default.Router();
router.post("/link-user-to-dietitian", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, dietitianId } = req.body;
    try {
        const userManager = new userProcessManager_1.UserProcessManager();
        const result = yield userManager.linkUserToDietitian(userId, dietitianId);
        (0, responseHandler_1.sendSuccess)(res, result, "User linked to dietitian successfully");
    }
    catch (error) {
        if (error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
router.get("/dietitian/:dietitianId/clients", (0, auth_1.auth)([UserRole_1.UserRole.DIETITIAN, UserRole_1.UserRole.ADMIN]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dietitianId = Number(req.params.dietitianId);
    try {
        const userManager = new userProcessManager_1.UserProcessManager();
        const clients = yield userManager.getClientsByDietitian(dietitianId);
        (0, responseHandler_1.sendSuccess)(res, clients, "Clients retrieved successfully");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound || error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(error);
        }
    }
}));
exports.default = router;
