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
          appointmentsAsUser: true,
          appointmentsAsDietitian: true,
          performances: true,
        },
      });
    } else if (/^\d+$/.test(identifier)) {
      user = await prisma.user.findUnique({
        where: { phoneNumber: loginData.identifier },
        include: {
          profile: true,
          mealPlans: true,
          appointmentsAsUser: true,
          appointmentsAsDietitian: true,
          performances: true,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: loginData.identifier },
        include: {
          profile: true,
          mealPlans: true,
          appointmentsAsUser: true,
          appointmentsAsDietitian: true,
          performances: true,
        },
      });
    }
    return user;
  };
}
