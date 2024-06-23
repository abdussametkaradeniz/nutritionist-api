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
    // const passwordHashed = await hashPassword(this.request.password);
    // this.request.password = "$2y$10$ARdN/9vRmnCFNkJVOO5SUO7cVVXm60JS.BL1P1Met3QPaZboKdQSybu";
    this.request.password = "1234";
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
