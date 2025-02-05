import { Request, Response, NextFunction } from "express";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";
export const validateDietitian = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // Kullanıcının diyetisyen rolüne sahip olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.roles.includes("DIETITIAN")) {
      throw new AppError("Only dietitians can access this resource", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
