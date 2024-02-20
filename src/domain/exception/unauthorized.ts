import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class Unauthorized extends Exception {
  constructor(message?: string, errorCode?: number) {
    super(message || "Unauthorized", StatusCodes.Unauthorized, errorCode);
  }
}
