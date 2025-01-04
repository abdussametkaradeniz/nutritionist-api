import jwt, { Secret } from "jsonwebtoken";
import config from "config";
import { UserType } from "../types/user/User";

const secretKey = config.get("jwtPrivateKey");

export function generateToken(user: UserType): string {
  console.log("user1111", user);
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles![0].name,
    permissions: user.permissions,
  };
  const token = jwt.sign(payload, secretKey as Secret, { expiresIn: "1h" });
  return token;
}

export function verifyToken(token: string): any | null {
  try {
    const decoded = jwt.verify(token, secretKey as Secret);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token has expired");
    } else {
      console.error("Token verification failed:", error);
    }
    return null;
  }
}
