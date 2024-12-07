import { UserGoals } from "./UserGoals";
import { UserRole } from "./UserRole";

export type RegisterType = {
  email: string;
  userName: string;
  password: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  phoneNumber?: number;
  age?: number;
  role: UserRole;
  weight?: number;
  height?: number;
  goals?: UserGoals;
  photoUrl?: string;
};
