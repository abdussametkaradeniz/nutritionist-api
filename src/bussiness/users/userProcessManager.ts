import { UserProcessDbManager } from "../../database/userProcessDbManager";
import { BusinessException, NotFound } from "../../domain/exception";

export class UserProcessManager {
  userProcessDbManager: UserProcessDbManager;

  constructor() {
    this.userProcessDbManager = new UserProcessDbManager();
  }

  async linkUserToDietitian(
    userId: number,
    dietitianId: number
  ): Promise<void> {
    try {
      const result = await this.userProcessDbManager.linkUserToDietitian(
        userId,
        dietitianId
      );
      return result;
    } catch (error) {
      // Add specific error handling as needed
      throw new BusinessException("Failed to link user to dietitian", 500);
    }
  }

  async getClientsByDietitian(dietitianId: number): Promise<any> {
    const clients =
      await this.userProcessDbManager.getClientsByDietitian(dietitianId);
    if (clients.length === 0) {
      throw new NotFound("No clients found for this dietitian");
    }
    return clients;
  }
}
