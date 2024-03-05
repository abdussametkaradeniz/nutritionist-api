import * as bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<any> {
  const salt = process.env.SECRET_PASSWORD_SALT!;
  const hashedPassword: string = await bcrypt.hash(password, salt);
  return hashedPassword;
}
