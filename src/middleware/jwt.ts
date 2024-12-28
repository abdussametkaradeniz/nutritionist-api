import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import { InvalidParameter } from "../domain/exception/invalid-parameter";
import { UserFields } from "../types/user/UserFields";
import { UserRole } from "../types/user/UserRole";

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
    role: UserRole.USER,
    roleId: 0,
    secondaryName: "",
    lastName: "",
    userName: "",
    permissions: [],
  };

  if (token && typeof token !== "string") {
    return next(new InvalidParameter("Invalid token format"));
  }

  try {
    let user: UserFields = defaultMember;
    if (token && token !== "0" && token !== "null" && token !== "undefined") {
      const verifiedUser = await verifyToken(token);
      if (verifiedUser !== null) {
        user = verifiedUser as unknown as UserFields;
      }
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
