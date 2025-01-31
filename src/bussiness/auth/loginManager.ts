import { LoginDbManager } from "../../database/loginDbManager";
import { InvalidParameter, NotFound } from "../../domain/exception";
import { generateTokens } from "../../helpers/jwt";
import { comparePassword } from "../../helpers/passwordHash";
import { TokenType } from "../../types/auth/TokenType";
import { UserLoginFields } from "../../types/user/login";
import { UserType } from "../../types/user/User";

export class LoginManager {
  request: UserLoginFields;
  loginDbManager: LoginDbManager;

  constructor(request: UserLoginFields) {
    this.request = request;
    this.loginDbManager = new LoginDbManager();
  }

  async findUniqueUser(): Promise<{ user: UserType; token: TokenType }> {
    const user: UserType = await this.loginDbManager.findUniqueUser(
      this.request
    );

    if (!user) {
      throw new NotFound("User not found");
    }

    const isPasswordValid = await comparePassword(
      this.request.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new InvalidParameter("Invalid credentials");
    }

    const jwt = await generateTokens(user);
    return { user, token: jwt };
  }
}
