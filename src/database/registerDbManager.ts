import prisma from "../../prisma/client";
import { UserType } from "../types/user/User";
export class RegisterDbManager {
  findEmail = async (email: string) => {
    const user = prisma.user.findUnique({ where: { email: email } });
    return user;
  };

  findUsername = async (username: string) => {
    const user = prisma.user.findUnique({ where: { userName: username } });
    return user;
  };

  findPhonenumber = async (phoneNumber: string) => {
    const user = prisma.user.findUnique({
      where: { phoneNumber: phoneNumber },
    });
    return user;
  };

  create = async (registerData: UserType): Promise<any> => {
    const user = prisma.user.create({
      data: {
        email: registerData.email,
        firstName: registerData.firstName,
        passwordHash: registerData.passwordHash,
        secondaryName: registerData.secondaryName,
        lastName: registerData.lastName,
        userName: registerData.userName,
        age: registerData.age,
        phoneNumber: registerData.phoneNumber,
        roleId: registerData.roleId,
      },
    });
    return user;
  };
}
