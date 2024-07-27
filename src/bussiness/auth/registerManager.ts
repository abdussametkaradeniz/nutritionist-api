import { RegisterDbManager } from "../../database/registerDbManager";
import { hashPassword } from "../../helpers/passwordHash";
import { UserType } from "../../types/user/User";

export class RegisterManager {
  request: UserType;
  registerDbManager: RegisterDbManager;
  constructor(request: UserType) {
    this.request = request;
    this.registerDbManager = new RegisterDbManager();
  }

  checkEmail = async () => {
    const result = await this.registerDbManager.findEmail(this.request.email);
    if (result) {
      return { result: "email already using" };
    }
  };

  checkPhoneNumber = async () => {
    const result = await this.registerDbManager.findPhonenumber(
      this.request.phoneNumber
    );
    if (result) {
      return { result: "phone number already using" };
    }
  };

  checkUsername = async () => {
    const result = await this.registerDbManager.findUsername(
      this.request.userName
    );
    if (result) {
      return { result: "username already using" };
    }
  };

  create = async () => {
    if (this.request.secondaryName === undefined) {
      this.request.secondaryName = "";
    }

    this.request.passwordHash = await hashPassword(this.request.passwordHash);

    const result = await this.registerDbManager.create({
      ...this.request,
    });

    return result;
  };
}
