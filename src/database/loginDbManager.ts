import prisma from "../../prisma/client";
import { UserLoginFields } from "../types/login";

export class LoginDbManager {
  findUniqueUser = async (loginData: UserLoginFields): Promise<any> => {
    const user = prisma.user.findUnique({
      where: { email: loginData.email },
    });
    return user;
  };
}
