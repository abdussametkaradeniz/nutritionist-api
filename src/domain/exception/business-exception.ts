import { Exception } from "./exception";

export class BusinessException extends Exception {
  constructor(message: string, status: number) {
    super(message, status);
  }
}
