import { StatusCodes } from "../../constants/statusCodes";

export class Exception extends Error {
  constructor(
    public message: string = "Ops! Something went wrong",
    public status: number = StatusCodes.InternalServerError
  ) {
    super(message);
    this.name = this.constructor.name;
    if (message) {
      this.message = message;
    }
    if (status) {
      this.status = status;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}
