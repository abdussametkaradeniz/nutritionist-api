import { UserGoals } from "./UserGoals";
import { UserRole } from "./UserRole";

export type ProfileType = {
  firstName: string;
  lastName: string;
  secondName?: string | null;
  age?: number | null;
  weight?: number | null;
  photoUrl?: string | null;
  goals: UserGoals;
};

export type RegisterType = {
  email: string;
  username: string;
  password: string;
  phoneNumber?: string | null;
  role: UserRole;
  weight?: number | null;
  height?: number | null;
  goals?: UserGoals | null;
  profile: ProfileType;
};
