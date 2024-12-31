import { UserRole } from "./UserRole";

export interface UserFields {
  age: number;
  email: string;
  firstName: string;
  password: string;
  phoneNumber: string;
  recordStatus: string;
  role: UserRole;
  roleId: number;
  secondaryName: string;
  lastName: string;
  userName: string;
  permissions: Permissions[];
}
