import prisma from "../../prisma/client";
import { UserFields } from "../types/user";
export class RegisterDbManager {
  create = async (registerData: UserFields): Promise<any> => {
    const user = prisma.user.create({
      data: {
        email: registerData.email,
        name: registerData.name,
        passwordHash: registerData.password,
        secondaryName: registerData.secondaryName,
        surname: registerData.surname,
        userName: registerData.userName,
        age: registerData.age,
        phoneNumber: registerData.phoneNumber,
        roleId: registerData.roleId,
      },
    });
    return user;
  };
}
