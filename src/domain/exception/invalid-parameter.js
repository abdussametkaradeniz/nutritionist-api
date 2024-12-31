"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidParameter = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class InvalidParameter extends exception_1.Exception {
    constructor(message) {
        super(message || "Invalid parameter.", statusCodes_1.StatusCodes.BadRequest);
    }
}
exports.InvalidParameter = InvalidParameter;
