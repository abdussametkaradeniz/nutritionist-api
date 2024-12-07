import { Permissions, UserRole } from "../domain/user";
import { verifyToken } from "../helpers/jwt";
import { UserFields } from "../types/user";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    export interface Request {
      user: UserFields;
    }
  }
}

export async function jwt(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies["token"] || req.header("x-auth-token");
  const defaultMember: UserFields = {
    age: 0,
    email: "",
    firstName: "",
    password: "",
    phoneNumber: "",
    recordStatus: "A",
    role: UserRole.User,
    roleId: 0,
    secondaryName: "",
    lastName: "",
    userName: "",
    permissions: [
      Permissions.edit_clients,
      Permissions.edit_own_profile,
      Permissions.view_own_profile,
    ],
  };

  try {
    let user: UserFields = defaultMember;
    if (token && token !== "0" && token !== "null" && token !== "undefined") {
      const verifiedUser = await verifyToken(token);
      if (verifiedUser !== null) {
        user = verifiedUser as UserFields;
      }
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
