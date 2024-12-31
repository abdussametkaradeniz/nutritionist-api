"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigException = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class ConfigException extends exception_1.Exception {
    constructor(message) {
        super(message || "something wrong with system", statusCodes_1.StatusCodes.InternalServerError);
    }
}
exports.ConfigException = ConfigException;
