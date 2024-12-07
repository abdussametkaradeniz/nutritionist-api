import prisma from "../../prisma/client";
import { UserLoginFields } from "../types/login";
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
          username: loginData.userName,
        },
      });
    } else if (loginData.phoneNumber) {
      user = await prisma.profile.findUnique({
        where: {
          phoneNumber: loginData.phoneNumber,
        },
      });
    }
    return user;
  };
}
