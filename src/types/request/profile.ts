export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  height?: number;
  weight?: number;
  address?: string;
  passwordHash?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePreferencesRequest {
  language?: string;
  timezone?: string;
  theme?: "LIGHT" | "DARK" | "SYSTEM";
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
}
