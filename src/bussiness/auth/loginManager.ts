import { LoginDbManager } from "../../database/loginDbManager";
import { NotFound } from "../../domain/exception";
import { UserLoginFields } from "../../types/login";
export class LoginManager {
  request: UserLoginFields;
  loginDbManager: LoginDbManager;
  constructor(request: UserLoginFields) {
    this.request = request;
    this.loginDbManager = new LoginDbManager();
  }

  findUniqueUser = async () => {
    const user = await this.loginDbManager.findUniqueUser({
      ...this.request,
    });

    const result = await this.loginDbManager.checkUserPassword(
      this.request.passwordHash,
      user.passwordHash
    );
    if (!result) return new NotFound();
    return user;
  };
}
