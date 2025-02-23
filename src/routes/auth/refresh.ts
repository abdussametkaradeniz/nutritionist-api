import express from "express";
import { BusinessException } from "../../domain/exception";
import { refreshAccessToken } from "../../helpers/jwt";

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
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BusinessException("Refresh token is required", 400);
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
