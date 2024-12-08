import prisma from "../../prisma/client";
import { RegisterType } from "../types/user/Register";
import { UserGoals } from "../types/user/UserGoals";
import { UserRole } from "../types/user/UserRole";
export class RegisterDbManager {
  findEmail = async (email: string) => {
    const user = prisma.user.findUnique({ where: { email: email } });
    return user;
  };

  findUsername = async (username: string) => {
    const user = prisma.user.findUnique({ where: { username: username } });
    return user;
  };

  findPhonenumber = async (phoneNumber: string) => {
    const user = prisma.user.findUnique({
      where: { phoneNumber: phoneNumber },
    });
    return user;
  };

  create = async (registerData: RegisterType): Promise<any> => {
    const user = prisma.user.create({
      data: {
        username: registerData.userName,
        email: registerData.email,
        passwordHash: registerData.password,
        role: registerData.role ?? UserRole.BASICUSER,
        phoneNumber: registerData.phoneNumber ?? "",
        profile: {
          create: {
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            age: registerData.age ?? 0,
            weight: registerData.weight ?? 0,
            goals: registerData.goals ?? UserGoals.GAINMUSCLES,
            photoUrl: registerData.photoUrl ?? "",
          }
        }
      },
    });
    return user;
  };
}
