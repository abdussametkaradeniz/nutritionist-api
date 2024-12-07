import * as bcrypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword: string = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  console.log(password, "bu password");
  console.log(hashedPassword, "bu da hashed password");
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}
