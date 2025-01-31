export interface PasswordResetType {
  email: string;
}

export interface PasswordResetConfirmType {
  token: string;
  newPassword: string;
}

export interface PasswordResetToken {
  userId: number;
  token: string;
  expiresAt: Date;
}
