export interface TokenType {
  accessToken: string;
  refreshToken: string;
  expiresIn: Date;
}

export interface RefreshTokenPayload {
  userId: number;
  token: string;
  expiresAt: Date;
}
