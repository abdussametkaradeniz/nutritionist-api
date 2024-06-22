import prisma from "../../prisma/client";
import { UserLoginFields } from "../types/login";
import * as bcrypt from "bcrypt";
export class LoginDbManager {
  findUniqueUser = async (loginData: UserLoginFields): Promise<any> => {
    let user;
    if (loginData.email) {
      user = await prisma.user.findUnique({
        where: { email: loginData.email },
      });
    } else if (loginData.userName) {
      user = await prisma.user.findUnique({
        where: {
          userName: loginData.userName,
        },
      });
    } else if (loginData.phoneNumber) {
      user = await prisma.user.findFirst({
        where: {
          phoneNumber: loginData.phoneNumber,
        },
      });
    }
    return user;
  };

  checkUserPassword = async (
    password: string,
    hashPassword: string
  ): Promise<any> => {
    return await bcrypt.compare(password, hashPassword);
  };
}
