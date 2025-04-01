import prisma from "../../prisma/client";
import { RegisterType } from "../types/user/Register";

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
    const user = prisma.user.findFirst({
      where: { phoneNumber: phoneNumber },
    });
    return user;
  };

  create = async (registerData: RegisterType): Promise<any> => {
    const user = await prisma.user.create({
      data: {
        username: registerData.username,
        email: registerData.email,
        passwordHash: registerData.password,
        roles: {
          connect: { name: registerData.role },
        },
        phoneNumber: registerData.phoneNumber || null,
        profile: {
          create: {
            firstName: registerData.profile.firstName,
            lastName: registerData.profile.lastName,
            secondName: registerData.profile.secondName || null,
            age: registerData.profile.age || null,
            weight: registerData.profile.weight || null,
            photoUrl: registerData.profile.photoUrl || null,
            isProfileCompleted: false,
            goals: registerData.profile.goals || "GAINWEIGHT",
          },
        },
      },
      include: {
        profile: true,
        roles: true,
        sessionsAsUser: true,
      },
    });
    return user;
  };
}
