import jwt, { Secret } from "jsonwebtoken";
import config from "config";
import { UserType } from "../types/user/User";

const secretKey = config.get("jwtPrivateKey");

export function generateToken(user: UserType): string {
  const token = jwt.sign(user, secretKey as Secret, { expiresIn: "1h" });
  return token;
}

export function verifyToken(token: string): UserType | null {
  try {
    const decoded = jwt.verify(token, secretKey as Secret) as UserType;
    return decoded;
  } catch (error) {
    return null;
  }
}
