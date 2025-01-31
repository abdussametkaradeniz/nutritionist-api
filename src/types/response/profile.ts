export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  height?: number;
  weight?: number;
  address?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastUpdateDate: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}
