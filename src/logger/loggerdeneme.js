"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = log;
function log(req, res, next) {
    console.log("logging");
    next();
}
