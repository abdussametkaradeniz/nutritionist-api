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
    console.log(registerData, "register data");
    const user = await prisma.user.create({
      data: {
        username: registerData.userName,
        email: registerData.email,
        passwordHash: registerData.password,
        roles: {
          connect: [{ name: registerData.role ?? "BASICUSER" }],
        },
        phoneNumber: registerData.phoneNumber ?? "",
        profile: {
          create: {
            firstName: registerData.firstName,
            lastName: registerData.lastName ?? "",
            secondName: registerData.secondName ?? "",
            age: registerData.age ?? 0,
            weight: registerData.weight ?? 0,
            goals: registerData.goals ?? "GAINMUSCLES",
            photoUrl: registerData.photoUrl ?? "",
            isProfileCompleted: false,
          },
        },
      },
    });
    return user;
  };
}
