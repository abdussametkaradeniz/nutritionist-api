import express, { Request, Response, NextFunction } from "express";
import { registerSchema } from "../../validations/registerValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { RegisterType } from "../../types/user/Register";
import { sendSuccess } from "../../helpers/responseHandler";
import {
  NotFound,
  InvalidParameter,
  BusinessException,
} from "../../domain/exception";
import { authLimiter } from "../../middleware/rateLimiter";
import { AuthService } from "../../services/authService";

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
const router: express.Router = express.Router();

const authService = new AuthService();

router.post(
  "/",
  requestValidator(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const request = req.body as RegisterType;
    try {
      const result = await authService.register(request);
      sendSuccess(res, { user: result }, "Register Successful");
    } catch (error: unknown) {
      if (
        error instanceof NotFound ||
        error instanceof InvalidParameter ||
        error instanceof BusinessException
      ) {
        next(error);
      } else {
        next(new Error(error as string));
      }
    }
  }
);

export default router;
