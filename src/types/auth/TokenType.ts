export interface TokenType {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenPayload {
  userId: number;
  token: string;
  expiresAt: Date;
}
