"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unauthorized = void 0;
const statusCodes_1 = require("../../constants/statusCodes");
const exception_1 = require("./exception");
class Unauthorized extends exception_1.Exception {
    constructor(message) {
        super(message || "Unauthorized", statusCodes_1.StatusCodes.Unauthorized);
    }
}
exports.Unauthorized = Unauthorized;
