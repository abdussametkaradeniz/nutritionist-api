export interface Session {
  userId: number;
  email: string;
  username: string;
  dietitianId?: number | null;
  createdAt: string;
  lastActivity: string;
}

export interface SessionData {
  id: string;
  userId: number;
  deviceInfo: {
    deviceId?: string;
    deviceType?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  lastActivity: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateSessionRequest {
  userId: number;
  deviceId?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateSessionRequest {
  lastActivity?: Date;
  isActive?: boolean;
}
