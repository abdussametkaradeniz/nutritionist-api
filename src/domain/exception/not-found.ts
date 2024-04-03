import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class NotFound extends Exception {
  constructor(message?: string) {
    super(message || "Not found.", StatusCodes.NotFound);
  }
}
