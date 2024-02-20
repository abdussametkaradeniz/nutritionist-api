import jwt, { Secret } from "jsonwebtoken";
import { UserFields } from "../types/user";
import config from "config";

const secretKey = config.get("jwtPrivateKey");

export function generateToken(user: UserFields): string {
  const token = jwt.sign(user, secretKey as Secret, { expiresIn: "1h" });
  return token;
}

export function verifyToken(token: string): UserFields | null {
  try {
    const decoded = jwt.verify(token, secretKey as Secret) as UserFields;
    return decoded;
  } catch (error) {
    return null;
  }
}
