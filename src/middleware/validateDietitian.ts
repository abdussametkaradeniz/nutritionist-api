import { Request, Response, NextFunction } from "express";
import { BusinessException } from "../domain/exception";

export const validateDietitian = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.permissions || !req.user?.permissions.includes("DIETITIAN")) {
    throw new BusinessException(
      "Bu işlem için diyetisyen yetkisi gereklidir",
      403
    );
  }
  next();
};
