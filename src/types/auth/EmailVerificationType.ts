export interface EmailVerificationToken {
  userId: number;
  token: string;
  expiresAt: Date;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}
