import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class NotFound extends Exception {
  constructor(message?: string, errorCode?: number) {
    super(message || "Not found.", StatusCodes.NotFound, errorCode);
  }
}
