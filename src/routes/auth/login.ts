import express, { NextFunction, Request, Response } from "express";
import { loginSchema } from "../../validations/auth/loginValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { PrismaClient } from "@prisma/client";
import { TokenService } from "../../services/tokenService";
import { SessionService } from "../../services/sessionService";
import { BusinessException } from "../../domain/exception";
import { comparePassword } from "../../helpers/password";

const router = express.Router();
const prisma = new PrismaClient();

router.post(
  "/",
  requestValidator(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BusinessException("Kullanıcı bulunamadı", 404);
      }

      // Şifre kontrolü
      const isValidPassword = await comparePassword(
        password,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new BusinessException("Geçersiz şifre", 401);
      }

      // Access ve Refresh token oluştur
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = await TokenService.generateRefreshToken(user);

      // Session oluştur
      const sessionId = await SessionService.createSession({
        userId: user.id,
        deviceId: req.headers["x-device-id"] as string,
        deviceType: req.headers["x-device-type"] as string,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.json({
        accessToken,
        refreshToken,
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          dietitianId: user.dietitianId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
