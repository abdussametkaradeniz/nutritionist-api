import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class InvalidParameter extends Exception {
  constructor(message?: string) {
    super(message || "Invalid parameter.", StatusCodes.BadRequest);
  }
}
