import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import { InvalidParameter } from "../domain/exception/invalid-parameter";
import { UserRole } from "../constants/userRoles";

export async function jwt(req: Request, res: Response, next: NextFunction) {
  const token = req.header("Authorization");

  if (!token) {
    return next(new InvalidParameter("Token is missing"));
  }

  if (typeof token !== "string") {
    return next(new InvalidParameter("Invalid token format"));
  }

  if (token && typeof token !== "string") {
    return next(new InvalidParameter("Invalid token format"));
  }
  try {
    const verifiedUser = await verifyToken(token);
    if (!verifiedUser) {
      console.error("Token verification failed: User is null");
      return next(new InvalidParameter("Invalid token"));
    }

    req.user = {
      roles: verifiedUser.roles,
      permissions: verifiedUser.permissions ? verifiedUser.permissions : [],
    };
    console.log("req.user", req.user);
    console.log("verifiedUser", verifiedUser);
    next();
  } catch (err) {
    console.error("Error during token verification:", err);
    next(err);
  }
}
