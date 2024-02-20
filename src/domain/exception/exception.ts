import { StatusCodes } from "../../constants/statusCodes";

export class Exception extends Error {
  constructor(
    public message: string = "Ops! Something went wrong",
    public status: number = StatusCodes.InternalServerError,
    public errorCode: number = 0,
    public sessionId: string = "",
    public subErrorCode: number = 0
  ) {
    super(message);
    this.name = this.constructor.name;
    this.errorCode;
    if (message) {
      this.message = message;
    }
    if (status) {
      this.status = status;
    }

    if (errorCode) {
      this.errorCode = errorCode;
    }

    if (subErrorCode) {
      this.subErrorCode = subErrorCode;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
