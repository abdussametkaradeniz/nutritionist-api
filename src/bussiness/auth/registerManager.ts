import { RegisterDbManager } from "../../database/registerDbManager";
import { BusinessException } from "../../domain/exception";
import { hashPassword } from "../../helpers/passwordHash";
import { RegisterType } from "../../types/user/Register";
import { UserType } from "../../types/user/User";

export class RegisterManager {
  request: RegisterType;
  registerDbManager: RegisterDbManager;
  constructor(request: RegisterType) {
    this.request = request;
    this.registerDbManager = new RegisterDbManager();
  }

  async create() {
    const findEmail = await this.registerDbManager.findEmail(this.request.email);

    if (findEmail) {
      throw new BusinessException("Email already using", 400);
    }

    if (this.request.phoneNumber) {
      const findPhoneNumber = await this.registerDbManager.findPhonenumber(
        this.request.phoneNumber!
      );

      if (findPhoneNumber) {
        throw new BusinessException("phone number already using", 400);
      }
    }

    const findUsername = await this.registerDbManager.findUsername(
      this.request.userName
    );

    if (findUsername) {
      throw new BusinessException("user name already using", 400);
    }

    this.request.password = await hashPassword(this.request.password);
    const result = await this.registerDbManager.create(this.request);
    return result;
  };
}
