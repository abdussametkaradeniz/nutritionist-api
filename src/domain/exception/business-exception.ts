import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class BusinessException extends Exception {
  isError: boolean;
  constructor(message: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.isError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
