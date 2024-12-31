"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = void 0;
const exception_1 = require("./exception");
class BusinessException extends exception_1.Exception {
    constructor(message, status) {
        super(message, status);
    }
}
exports.BusinessException = BusinessException;
