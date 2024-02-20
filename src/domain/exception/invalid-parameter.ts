import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class InvalidParameter extends Exception {
  constructor(message?: string, errorCode?: number) {
    super(message || "Invalid parameter.", StatusCodes.BadRequest, errorCode);
  }
}
