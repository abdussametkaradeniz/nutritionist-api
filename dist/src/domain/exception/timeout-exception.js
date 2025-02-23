"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOut = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class TimeOut extends exception_1.Exception {
    constructor(message) {
        super(message || "timeout", statusCodes_1.StatusCodes.GatewayTimeout);
    }
}
exports.TimeOut = TimeOut;
