import prisma from "../../prisma/client";
import { UserLoginFields } from "../types/user/login";
export class LoginDbManager {
  findUniqueUser = async (loginData: UserLoginFields): Promise<any> => {
    const { identifier, password } = loginData;
    let user;
    if (identifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: loginData.identifier },
        include: {
          profile: true,
          mealPlans: true,
          performances: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    } else if (/^\d+$/.test(identifier)) {
      user = await prisma.user.findFirst({
        where: { phoneNumber: loginData.identifier },
        include: {
          profile: true,
          mealPlans: true,
          performances: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: { username: loginData.identifier },
        include: {
          profile: true,
          mealPlans: true,
          performances: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    }
    return user;
  };
}
