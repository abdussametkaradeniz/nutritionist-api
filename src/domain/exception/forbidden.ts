import { StatusCodes } from "../../constants/statusCodes";
import { Exception } from "./exception";

export class Forbidden extends Exception {
  constructor(message?: string) {
    super(message || "Forbidden", StatusCodes.Forbidden);
  }
}
