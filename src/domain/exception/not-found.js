"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class NotFound extends exception_1.Exception {
    constructor(message) {
        super(message || "Not found.", statusCodes_1.StatusCodes.NotFound);
    }
}
exports.NotFound = NotFound;
