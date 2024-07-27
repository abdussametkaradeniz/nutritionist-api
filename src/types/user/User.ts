import { UserRole } from "./UserRole";

export type UserType = {
  id?: number;
  email: string;
  userName: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: number;
  secondaryName: string;
  recordStatus: string;
  roleId: number;
  role: UserRole;
  permissions: string[];
  applicationName: string[];
};
