import { SessionDbManager } from "../database/user/sessionDbManager";
import { CreateSessionRequest, UpdateSessionRequest } from "../types/session";
import { BusinessException } from "../domain/exception";

export class SessionService {
  private static sessionDb = new SessionDbManager();

  static async createSession(data: CreateSessionRequest) {
    return await this.sessionDb.createSession(data);
  }

  static async getSession(sessionId: string) {
    const session = await this.sessionDb.getSession(sessionId);
    if (!session) {
      throw new BusinessException("Session bulunamadı", 404);
    }
    return session;
  }

  static async getUserSessions(userId: number) {
    return await this.sessionDb.getUserSessions(userId);
  }

  static async updateSession(sessionId: string, data: UpdateSessionRequest) {
    await this.getSession(sessionId); // Session var mı kontrol et
    return await this.sessionDb.updateSession(sessionId, data);
  }

  static async deactivateSession(sessionId: string) {
    await this.getSession(sessionId); // Session var mı kontrol et
    return await this.sessionDb.deactivateSession(sessionId);
  }

  static async deactivateUserSessions(userId: number) {
    return await this.sessionDb.deactivateUserSessions(userId);
  }

  static async cleanupInactiveSessions() {
    return await this.sessionDb.cleanupInactiveSessions();
  }
}
