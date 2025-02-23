"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
function sendSuccess(res, result, message = "Request successful", status = 200) {
    const safeResult = JSON.parse(JSON.stringify(result));
    return res.status(status).json({
        isError: false,
        result: safeResult,
        message: message,
        status: status,
    });
}
