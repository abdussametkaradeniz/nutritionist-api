import { Role } from "@prisma/client";

export interface UserType {
  id?: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  passwordHash: string;
  dietitianId?: number | null;
  userRoles?: Role[];
  permissions?: string[];
  lastUpdatingUser?: string | null;
  lastUpdateDate?: Date | null;
  recordStatus?: string | null;
}

export interface UserInclude {
  roles?: boolean;
  permissions?: boolean;
  profile?: boolean;
}
