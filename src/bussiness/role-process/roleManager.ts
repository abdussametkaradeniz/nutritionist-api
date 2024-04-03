import { RoleDbManager } from "../../database/roleDbManager";
import { BusinessException } from "../../domain/exception";

export class RoleManager {
  roleDbManager: RoleDbManager;

  constructor() {
    this.roleDbManager = new RoleDbManager();
  }

  getAllRoles = async () => {
    const roles = await this.roleDbManager.getAllRoles();
    if (!roles) return new BusinessException("Oops");
    console.log(roles);
    return roles;
  };
}
