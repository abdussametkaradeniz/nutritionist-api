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
const responseHandler_1 = require("../../helpers/responseHandler");
const exception_1 = require("../../domain/exception");
const authService_1 = require("../../services/authService");
/**
 * @swagger
 * /api/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Yeni kullanıcı kaydı
 *     description: Yeni bir kullanıcı hesabı oluşturur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcının email adresi
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcı şifresi (min 8 karakter)
 *               username:
 *                 type: string
 *                 description: Kullanıcı adı
 *               firstName:
 *                 type: string
 *                 description: Kullanıcının adı
 *               lastName:
 *                 type: string
 *                 description: Kullanıcının soyadı
 *               phoneNumber:
 *                 type: string
 *                 description: Telefon numarası
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: Geçersiz veri
 *       409:
 *         description: Email/username zaten kullanımda
 *       429:
 *         description: Çok fazla deneme
 */
const router = express_1.default.Router();
const authService = new authService_1.AuthService();
router.post("/", (0, requestValidator_1.requestValidator)(registerValidator_1.registerSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const request = req.body;
    try {
        const result = yield authService.register(request);
        (0, responseHandler_1.sendSuccess)(res, { user: result }, "Register Successful");
    }
    catch (error) {
        if (error instanceof exception_1.NotFound ||
            error instanceof exception_1.InvalidParameter ||
            error instanceof exception_1.BusinessException) {
            next(error);
        }
        else {
            next(new Error("An unexpected error occurred"));
        }
    }
}));
exports.default = router;
