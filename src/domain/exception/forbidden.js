"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forbidden = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class Forbidden extends exception_1.Exception {
    constructor(message) {
        super(message || "Forbidden", statusCodes_1.StatusCodes.Forbidden);
    }
}
exports.Forbidden = Forbidden;
