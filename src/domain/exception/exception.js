"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exception = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
class Exception extends Error {
    constructor(message = "Ops! Something went wrong", status = statusCodes_1.StatusCodes.InternalServerError) {
        super(message);
        this.message = message;
        this.status = status;
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
exports.Exception = Exception;
