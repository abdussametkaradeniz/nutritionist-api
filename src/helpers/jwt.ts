import jwt, { Secret } from "jsonwebtoken";
import config from "config";
import { UserType } from "../types/user/User";

const secretKey = config.get("jwtPrivateKey");

export function generateToken(user: UserType): string {
  const payload = {
    id: user.id,
    username: user.userName,
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, secretKey as Secret, { expiresIn: "1h" });
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
