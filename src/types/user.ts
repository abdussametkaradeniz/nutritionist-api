import { Permissions, UserRole } from "../domain/user";

export type UserFields = {
  id?: number;
  email: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  secondaryName: string;
  recordStatus: string;
  roleId: number;
  role: UserRole;
  permissions: Permissions[];
};
