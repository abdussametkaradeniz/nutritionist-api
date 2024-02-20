import { LoginDbManager } from "../../database/loginDbManager";
import { UserLoginFields } from "../../types/login";
export class LoginManager {
  request: UserLoginFields;
  loginDbManager: LoginDbManager;
  constructor(request: UserLoginFields) {
    this.request = request;
    this.loginDbManager = new LoginDbManager();
  }

  findUniqueUser = async () => {
    //password hashlenecek
    //kullanici var mi bakilacak

    const result = await this.loginDbManager.findUniqueUser({
      ...this.request,
    });

    return result;
  };
}
