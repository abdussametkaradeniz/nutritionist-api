import { Request, Response, NextFunction } from "express";
import prisma from "../../prisma/client";
import { AppError } from "../utils/appError";

export const validateProfileCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const profile = await prisma.dietitianProfile.findUnique({
      where: { userId },
      select: {
        bio: true,
        education: true,
        experience: true,
        specializations: true,
        certificates: true,
        workingHours: true,
        pricingPackages: true,
      },
    });

    if (!profile) {
      throw new AppError("Diyetisyen profili bulunamadı", 404);
    }

    // Zorunlu alanların kontrolü
    const isProfileComplete =
      profile.bio &&
      profile.education.length > 0 &&
      profile.experience > 0 &&
      profile.specializations.length > 0 &&
      profile.workingHours.length > 0 &&
      profile.pricingPackages.length > 0;

    if (!isProfileComplete) {
      throw new AppError(
        "Lütfen profilinizi tamamlayın. Eksik alanlar: " +
          [
            !profile.bio && "Biyografi",
            profile.education.length === 0 && "Eğitim bilgileri",
            profile.experience === 0 && "Deneyim",
            profile.specializations.length === 0 && "Uzmanlık alanları",
            profile.workingHours.length === 0 && "Çalışma saatleri",
            profile.pricingPackages.length === 0 && "Fiyatlandırma paketleri",
          ]
            .filter(Boolean)
            .join(", "),
        400
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
