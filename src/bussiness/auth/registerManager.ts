import { RegisterDbManager } from "../../database/registerDbManager";
import { UserFields } from "../../types/user";

export class RegisterManager {
  request: UserFields;
  registerDbManager: RegisterDbManager;
  constructor(request: UserFields) {
    this.request = request;
    this.registerDbManager = new RegisterDbManager();
  }

  create = async () => {
    //dbde boyle bir kullanici var mi?
    //gelen requestteki passwordu hasleyecez
    if (this.request.secondaryName === undefined) {
      this.request.secondaryName = "";
    }
    const result = await this.registerDbManager.create({
      ...this.request,
    });

    return result;
  };
}
