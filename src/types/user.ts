import { Permissions, UserRole } from "../domain/user";

export type UserFields = {
  id?: number;
  email: string;
  userName: string;
  password: string;
  name: string;
  surname: string;
  phoneNumber: number;
  age: number;
  secondaryName: string;
  recordStatus: string;
  roleId: number;
  role: UserRole;
  permissions: Permissions[];
};
