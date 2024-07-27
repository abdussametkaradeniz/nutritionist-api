import { LoginDbManager } from "../../database/loginDbManager";
import { NotFound, Unauthorized } from "../../domain/exception";
import { StatusCodes } from "../../constants/statusCodes";
import { comparePassword } from "../../helpers/passwordHash";
import { UserLoginFields } from "../../types/login";
import { UserType } from "../../types/user/User";
export class LoginManager {
  request: UserLoginFields;
  loginDbManager: LoginDbManager;
  constructor(request: UserLoginFields) {
    this.request = request;
    this.loginDbManager = new LoginDbManager();
  }

  findUniqueUser = async () => {
    try {
      const user: UserType = await this.loginDbManager.findUniqueUser({
        ...this.request,
      });

      if (!user) return new NotFound();

      const result = await comparePassword(
        this.request.passwordHash,
        user.passwordHash
      );

      if (!result) {
        return new Unauthorized();
      }
      console.log(user);
      return {
        isError: false,
        user,
        StatusCode: StatusCodes.Ok,
      };
    } catch (error) {
      return {
        isError: true,
        error: error,
        statusCode: StatusCodes.BadRequest,
      };
    }
  };
}
