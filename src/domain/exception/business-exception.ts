import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class BusinessException extends Exception {
  constructor(message?: string) {
    super(message || "Bad Request", StatusCodes.Ok);
  }
}
