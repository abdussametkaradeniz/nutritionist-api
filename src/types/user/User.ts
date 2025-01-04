import { UserRole } from "./UserRole";

export type UserType = {
  id?: number;
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age?: number;
  secondaryName?: string;
  recordStatus?: string;
  roleId?: number;
  roles?: {
    name: string;
  }[];
  permissions?: string[];
  applicationName?: string[];
  dietitianId?: number | null;
  lastUpdatingUser?: any;
  lastUpdateDate?: Date;
  profile?: {
    id: number;
    userId: number;
    firstName: string;
    secondName: string;
    lastName: string;
    age: number;
    weight: number;
    isProfileCompleted: boolean;
    goals: string;
    photoUrl: string;
    lastUpdatingUser: any;
    lastUpdateDate: Date;
    recordStatus: string;
  };
  mealPlans?: any[];
  appointmentsAsUser?: any[];
  appointmentsAsDietitian?: {
    id: number;
    userId: number;
    dietitianId: number;
    date: Date;
    status: string;
    lastUpdatingUser: any;
    lastUpdateDate: Date;
    recordStatus: string;
  }[];
  performances?: any[];
};
