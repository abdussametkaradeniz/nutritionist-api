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
const exception_1 = require("../../domain/exception");
const jwt_1 = require("src/helpers/jwt");
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Access token yenileme
 *     description: Refresh token kullanarak yeni bir access token alır
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Geçerli refresh token
 *     responses:
 *       200:
 *         description: Token başarıyla yenilendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Yeni access token
 *                 refreshToken:
 *                   type: string
 *                   description: Yeni refresh token
 *       401:
 *         description: Geçersiz refresh token
 *       403:
 *         description: Refresh token süresi dolmuş
 */
const router = express_1.default.Router();
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new exception_1.BusinessException("Refresh token is required", 400);
        }
        const newAccessToken = yield (0, jwt_1.refreshAccessToken)(refreshToken);
        res.json({
            accessToken: newAccessToken,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
