import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class ConfigException extends Exception {
  constructor(message?: string) {
    super(
      message || "something wrong with system",
      StatusCodes.InternalServerError
    );
  }
}
