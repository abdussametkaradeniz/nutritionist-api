"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCodes = void 0;
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["Ok"] = 200] = "Ok";
    StatusCodes[StatusCodes["Created"] = 201] = "Created";
    StatusCodes[StatusCodes["Accepted"] = 202] = "Accepted";
    StatusCodes[StatusCodes["BadRequest"] = 400] = "BadRequest";
    StatusCodes[StatusCodes["Unauthorized"] = 401] = "Unauthorized";
    StatusCodes[StatusCodes["Forbidden"] = 403] = "Forbidden";
    StatusCodes[StatusCodes["NotFound"] = 404] = "NotFound";
    StatusCodes[StatusCodes["TooManyRequests"] = 429] = "TooManyRequests";
    StatusCodes[StatusCodes["InternalServerError"] = 500] = "InternalServerError";
    StatusCodes[StatusCodes["BadGateway"] = 502] = "BadGateway";
    StatusCodes[StatusCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    StatusCodes[StatusCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(StatusCodes || (exports.StatusCodes = StatusCodes = {}));
