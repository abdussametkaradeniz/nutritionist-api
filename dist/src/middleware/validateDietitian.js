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
exports.validateDietitian = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const appError_1 = require("../utils/appError");
const validateDietitian = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            throw new appError_1.AppError("Unauthorized", 401);
        }
        // Kullanıcının diyetisyen rolüne sahip olup olmadığını kontrol et
        const user = yield client_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!(user === null || user === void 0 ? void 0 : user.roles.includes("DIETITIAN"))) {
            throw new appError_1.AppError("Only dietitians can access this resource", 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateDietitian = validateDietitian;
