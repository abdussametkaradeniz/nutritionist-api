import express from "express";
import { TokenService } from "../../services/tokenService";
import { BusinessException } from "../../domain/exception";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BusinessException("Refresh token is required", 400);
    }

    const newAccessToken = await TokenService.refreshAccessToken(refreshToken);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
